"""
Extract a 3-colour palette from each product image and write it into
src/data/products.ts as `imagePalettes`.

Each card's spray/halo is built from these colours, so the glow behind a
garment is made of the garment's own tones (light-blue denim -> light blue,
soft grey, subtle yellow) instead of one flat hue.

Decoding goes through ffmpeg so this needs no Python imaging deps.
Run from the project root:  python3 extract_palettes.py
"""

import colorsys
import os
import re
import subprocess
import sys
from collections import defaultdict

SIZE = 128           # decode size — plenty for colour statistics
ALPHA_MIN = 200      # ignore soft/cut-out edges, keep solid garment pixels
N_COLORS = 3

BASE = "public/images"
CATEGORIES = ["caps", "tees", "jeans", "hoodies", "accessories"]
PRODUCTS_TS = "src/data/products.ts"


def decode(path):
    """Return a list of (r, g, b, a) via ffmpeg."""
    out = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", path,
         "-vf", f"scale={SIZE}:{SIZE}",
         "-f", "rawvideo", "-pix_fmt", "rgba", "-"],
        capture_output=True, check=True,
    ).stdout
    return [tuple(out[i:i + 4]) for i in range(0, len(out), 4)]


def palette(path, n=N_COLORS):
    """Dominant, perceptually distinct colours, most prominent first.

    Ranked by hue *family* rather than by raw bin. Washed-out product shots
    fragment their colourful pixels across many fine bins while the neutrals
    pile into one, so ranking bins directly returns three greys. Families fix
    that; within a family the representative is saturation-weighted so it
    leans toward the pixels that actually carry the colour.
    """
    px = decode(path)

    GREY = -1
    fam = defaultdict(lambda: [0, 0.0, 0.0, 0.0, 0.0])  # count, wsum, r, g, b
    for r, g, b, a in px:
        if a < ALPHA_MIN:
            continue
        h, s_, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)

        if v < 0.10:                 # crushed shadow
            continue
        if v > 0.97 and s_ < 0.06:   # blown highlight / paper white
            continue

        key = GREY if s_ < 0.05 else int(h * 360) // 20
        w = 1.0 if key == GREY else s_ + 0.05   # favour the chromatic samples

        acc = fam[key]
        acc[0] += 1
        acc[1] += w
        acc[2] += r * w
        acc[3] += g * w
        acc[4] += b * w

    if not fam:
        return [(0, 4, 60)] * n

    ranked = []
    for key, (count, wsum, rs, gs, bs) in fam.items():
        ranked.append((count, key, (rs / wsum, gs / wsum, bs / wsum)))
    ranked.sort(key=lambda t: -t[0])

    # Pick distinct families, allowing at most one neutral so the palette
    # keeps a soft grey without collapsing into three of them.
    def pick(max_grey, min_dist):
        out, greys = [], 0
        for count, key, rgb in ranked:
            if key == GREY:
                if greys >= max_grey:
                    continue
            if any(sum((x - y) ** 2 for x, y in zip(rgb, c)) < min_dist ** 2 for _, c in out):
                continue
            out.append((key, rgb))
            if key == GREY:
                greys += 1
            if len(out) == n:
                break
        return out

    chosen = pick(1, 40) or []
    if len(chosen) < n:                      # near-monochrome garment
        chosen = pick(n, 22)
    while len(chosen) < n:
        chosen.append(ranked[min(len(chosen), len(ranked) - 1)][1:])

    out = []
    seen = set()
    for _, (r, g, b) in chosen:
        h, s_, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
        # Washed denim sits at 2-9% saturation — true to the garment, but
        # invisible as a glow. Lift from a floor so the hue reads, while
        # genuinely achromatic tones stay grey and act as the neutral.
        s_out = 0.04 if s_ < 0.05 else min(0.72, 0.16 + s_ * 1.5)
        l_out = 0.46 + 0.30 * v              # land in a 46-76% band

        # A near-monochrome garment can fall back to the same family twice;
        # offset the repeat so the three blooms still read as three.
        hsl = (round(h * 360), round(s_out * 100), round(l_out * 100))
        while hsl in seen:
            hsl = (hsl[0], hsl[1], min(78, hsl[2] + 9))
        seen.add(hsl)
        out.append(hsl)
    return out


def main():
    if not os.path.isdir(BASE):
        sys.exit(f"run me from the project root — {BASE} not found")

    results = {}
    for cat in CATEGORIES:
        d = os.path.join(BASE, cat)
        if not os.path.isdir(d):
            continue
        for fname in sorted(os.listdir(d)):
            if fname.startswith(".") or not fname.lower().endswith((".png", ".jpg", ".jpeg", ".webp")):
                continue
            key = f"/images/{cat}/{fname}"
            cols = palette(os.path.join(d, fname))
            results[key] = cols
            print(f"✓ {key}")
            for h, s, l in cols:
                print(f"    hsl({h} {s}% {l}%)")

    block = ["export const imagePalettes: Record<string, string[]> = {"]
    for key, cols in results.items():
        vals = ", ".join(f"'{h} {s}% {l}%'" for h, s, l in cols)
        block.append(f"  '{key}': [{vals}],")
    block.append("};")
    block = "\n".join(block)

    src = open(PRODUCTS_TS).read()
    pattern = re.compile(r"export const imagePalettes: Record<string, string\[\]> = \{.*?\n\};", re.S)
    if pattern.search(src):
        src = pattern.sub(block, src)
    else:
        anchor = "export const getPlaceholderGradient"
        src = src.replace(anchor, block + "\n\n" + anchor, 1)
    open(PRODUCTS_TS, "w").write(src)
    print(f"\nWrote {len(results)} palettes into {PRODUCTS_TS}")


if __name__ == "__main__":
    main()
