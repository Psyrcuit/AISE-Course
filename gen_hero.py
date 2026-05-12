"""Generate a second hero image: pinwheel of module lobes.

Closer to what the live force-graph actually renders: 16 elliptical
clusters arranged in a ring, each cluster oriented radially (long axis
pointing outward from center). Single-rest deterministic so the image
is reproducible.

1200x1200, dark surface. Output: hero-map.png + hero-map.jpg.
"""
import math
import random
from PIL import Image, ImageDraw, ImageFilter, ImageFont

W = H = 1200
BG = (8, 8, 12)
GLOW = (139, 92, 246)
TEXT = (244, 244, 245)
TEXT_2 = (152, 152, 168)

# Module colors - same hue ramp the live canvas uses.
MODULE_HUES = [
    "#E26A6A", "#E89656", "#E5BB58", "#B7D661", "#7CD686",
    "#5CD0B0", "#5BBED7", "#5C9CDB", "#7C8BDD", "#A284E0",
    "#C586D9", "#DC7AB8", "#E6708A", "#E89D63", "#A2D175", "#5CB7DD"
]

N_MODULES = 16
# Per-module concept counts (rough averages, vary so lobes have
# different visual densities like the real map).
CONCEPTS_PER_MODULE = [
    41, 28, 32, 36, 38, 26, 30, 28,
    34, 24, 30, 28, 36, 32, 34, 32
]

RING_R = 360            # distance from center to each module's anchor
LOBE_LONG = 110         # ellipse long-axis (radial direction)
LOBE_SHORT = 70         # ellipse short-axis (tangential direction)


def font(name, size):
    return ImageFont.truetype(f"C:/Windows/Fonts/{name}", size)


random.seed(7)

img = Image.new("RGB", (W, H), BG)

# Soft top-center violet glow.
glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
gd = ImageDraw.Draw(glow)
for r in range(int(W * 0.85), 0, -25):
    t = 1 - (r / (W * 0.85))
    a = int(40 * t * t)
    if a < 1:
        continue
    gd.ellipse([W // 2 - r, 40 - r, W // 2 + r, 40 + r],
               fill=(*GLOW, a))
glow = glow.filter(ImageFilter.GaussianBlur(80))
img = Image.alpha_composite(img.convert("RGBA"), glow).convert("RGB")

draw = ImageDraw.Draw(img)

cx, cy = W // 2, H // 2 + 60   # nudge the wheel down a bit to leave header room

# Each module: a tight cloud of dots inside a radially-oriented ellipse.
for i in range(N_MODULES):
    angle = (i / N_MODULES) * math.pi * 2 - math.pi / 2  # module 1 at top, clockwise
    mx = cx + math.cos(angle) * RING_R
    my = cy + math.sin(angle) * RING_R
    color = MODULE_HUES[i]
    cos_a = math.cos(angle)
    sin_a = math.sin(angle)

    count = CONCEPTS_PER_MODULE[i]
    # Sample inside a unit disc, scale into the lobe ellipse, then rotate so
    # the long axis points radially outward (along the unit vector from
    # origin to module center). Slight density falloff toward edges via a
    # Gaussian-ish radial weighting.
    for _ in range(count):
        # Sample uniform-ish point in the unit disc with a soft falloff.
        u = random.random()
        v = random.random()
        rho = math.sqrt(u) * 0.95             # uniform in disc area
        theta = 2 * math.pi * v
        ex = math.cos(theta) * rho * LOBE_LONG
        ey = math.sin(theta) * rho * LOBE_SHORT
        # Rotate the ellipse so its long axis is radial.
        rx = ex * cos_a - ey * sin_a
        ry = ex * sin_a + ey * cos_a
        x = mx + rx
        y = my + ry
        # Dot radius - slight jitter for organic feel.
        radius = 4.5 + random.random() * 2.5
        # Faint outer halo on a small fraction of dots to suggest depth.
        if random.random() < 0.10:
            halo = Image.new("RGBA", (24, 24), (0, 0, 0, 0))
            hd = ImageDraw.Draw(halo)
            hr = 11
            hcol = tuple(int(color[1 + 2 * k:3 + 2 * k], 16) for k in range(3)) + (60,)
            hd.ellipse([12 - hr, 12 - hr, 12 + hr, 12 + hr], fill=hcol)
            halo = halo.filter(ImageFilter.GaussianBlur(5))
            img.paste(halo, (int(x - 12), int(y - 12)), halo)
            draw = ImageDraw.Draw(img)
        draw.ellipse([x - radius, y - radius, x + radius, y + radius],
                     fill=color)

# Brand row at the top.
brand_text = "AISE 26"
brand_font = font("segoeuib.ttf", 60)
b_bbox = draw.textbbox((0, 0), brand_text, font=brand_font)
b_w = b_bbox[2] - b_bbox[0]
draw.text(((W - b_w) // 2, 70), brand_text, fill=TEXT, font=brand_font)

# Subtitle.
sub = "The map of everything a 2026 AI Solutions Engineer needs."
sub_font = font("segoeui.ttf", 26)
s_bbox = draw.textbbox((0, 0), sub, font=sub_font)
s_w = s_bbox[2] - s_bbox[0]
draw.text(((W - s_w) // 2, 148), sub, fill=TEXT_2, font=sub_font)

# URL bottom.
url_font = font("consola.ttf", 30)
url_text = "aise.psyrcuit.com"
u_bbox = draw.textbbox((0, 0), url_text, font=url_font)
u_w = u_bbox[2] - u_bbox[0]
draw.text(((W - u_w) // 2, H - 80), url_text, fill=TEXT_2, font=url_font)

img.save("hero-map.png", "PNG", optimize=True)
img.convert("RGB").save(
    "hero-map.jpg", "JPEG",
    quality=90, optimize=False, progressive=False, subsampling=2,
)
print("hero-map.png + hero-map.jpg written - 1200x1200")
