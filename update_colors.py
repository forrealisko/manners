import os, colorsys
from PIL import Image

def get_hsl(path):
    img = Image.open(path).convert('RGBA')
    img = img.resize((100, 100), Image.LANCZOS)
    pixels = list(img.getdata())
    opaque = [(r, g, b) for r, g, b, a in pixels if a > 128]
    if len(opaque) < 10: return 0, 0
    
    r_avg = sum(r for r,g,b in opaque) / len(opaque)
    g_avg = sum(g for r,g,b in opaque) / len(opaque)
    b_avg = sum(b for r,g,b in opaque) / len(opaque)
    
    h, s, v = colorsys.rgb_to_hsv(r_avg/255, g_avg/255, b_avg/255)
    return int(h * 360), int(s * 100)

base = "public/images"
results = {}

for cat in ['caps', 'tees', 'jeans', 'hoodies', 'accessories']:
    cat_dir = os.path.join(base, cat)
    if not os.path.isdir(cat_dir): continue
    for fname in sorted(os.listdir(cat_dir)):
        if fname.startswith('.') or not fname.lower().endswith(('.png', '.jpg')): continue
        path = os.path.join(cat_dir, fname)
        try:
            h, s = get_hsl(path)
            results[f"/images/{cat}/{fname}"] = {"hue": h, "sat": s}
        except: pass

print("export const imageColors: Record<string, {hue: number, sat: number}> = {")
for k, v in results.items():
    print(f"  '{k}': {{ hue: {v['hue']}, sat: {v['sat']} }},")
print("};")
