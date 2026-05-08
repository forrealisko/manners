"""
Extract dominant colors from product images and generate CSS gradients.
Uses k-means clustering on non-transparent pixels.
"""
from PIL import Image
import os, json, colorsys
from collections import Counter

def get_dominant_colors(path, n=3):
    """Extract n dominant colors from an image, ignoring transparent pixels."""
    img = Image.open(path).convert('RGBA')
    # Resize for speed
    img = img.resize((150, 150), Image.LANCZOS)
    pixels = list(img.getdata())
    
    # Filter out transparent/near-transparent pixels
    opaque = [(r, g, b) for r, g, b, a in pixels if a > 128]
    
    if len(opaque) < 10:
        return [(60, 60, 60), (30, 30, 30)]
    
    # Quantize to reduce color space
    quantized = []
    for r, g, b in opaque:
        qr = (r // 24) * 24
        qg = (g // 24) * 24
        qb = (b // 24) * 24
        quantized.append((qr, qg, qb))
    
    counter = Counter(quantized)
    top_colors = [c for c, _ in counter.most_common(n * 3)]
    
    # Filter out near-white and near-black, keep interesting colors
    filtered = []
    for r, g, b in top_colors:
        h, s, v = colorsys.rgb_to_hsv(r/255, g/255, b/255)
        # Skip pure white/black but keep dark tones
        if v < 0.05 and s < 0.1:
            continue
        if v > 0.95 and s < 0.05:
            continue
        filtered.append((r, g, b))
    
    if len(filtered) < 2:
        filtered = top_colors[:2]
    
    return filtered[:n]

def darken(rgb, factor=0.6):
    """Darken a color for gradient endpoints."""
    return tuple(int(c * factor) for c in rgb)

def lighten(rgb, factor=1.2):
    """Slightly lighten a color."""
    return tuple(min(255, int(c * factor)) for c in rgb)

def to_hex(rgb):
    return '#{:02x}{:02x}{:02x}'.format(*rgb)

def make_gradient(colors):
    """Create a CSS gradient from dominant colors."""
    if len(colors) >= 2:
        c1 = colors[0]
        c2 = darken(colors[1], 0.65)
    else:
        c1 = colors[0]
        c2 = darken(c1, 0.5)
    return f"linear-gradient(135deg, {to_hex(c1)} 0%, {to_hex(c2)} 100%)"

# Scan all image directories
base = "public/images"
results = {}

for category in ['caps', 'tees', 'jeans', 'hoodies', 'accessories']:
    cat_dir = os.path.join(base, category)
    if not os.path.isdir(cat_dir):
        continue
    for fname in sorted(os.listdir(cat_dir)):
        if fname.startswith('.'):
            continue
        if not fname.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
            continue
        fpath = os.path.join(cat_dir, fname)
        try:
            colors = get_dominant_colors(fpath)
            gradient = make_gradient(colors)
            results[f"/images/{category}/{fname}"] = {
                "colors": [to_hex(c) for c in colors],
                "gradient": gradient
            }
            print(f"✓ {category}/{fname}")
            print(f"  Colors: {[to_hex(c) for c in colors]}")
            print(f"  Gradient: {gradient}")
            print()
        except Exception as e:
            print(f"✗ {category}/{fname}: {e}")

# Output as TypeScript
print("\n" + "="*60)
print("TYPESCRIPT GRADIENTS MAP:")
print("="*60 + "\n")

print("export const imageGradients: Record<string, string> = {")
for path, data in results.items():
    print(f"  '{path}': '{data['gradient']}',")
print("};")
