"""Generate a second hero image: stylized System Map pinwheel.

Renders the same pinwheel layout the live force-graph settles into,
but as a clean static PNG suitable for a LinkedIn post-image slot.
1200x1200 square. Dark theme.
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
CONCEPTS_PER_MODULE = 32  # average, ~514/16
RADIUS = 380              # ring radius
CLUSTER_R = 95            # spread of concepts within a module


def font(name, size):
    return ImageFont.truetype(f"C:/Windows/Fonts/{name}", size)


# Deterministic spread per module so the image is reproducible.
random.seed(42)

img = Image.new("RGB", (W, H), BG)

# Soft top-center violet glow.
glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
gd = ImageDraw.Draw(glow)
for r in range(int(W * 0.85), 0, -25):
    t = 1 - (r / (W * 0.85))
    a = int(45 * t * t)
    if a < 1:
        continue
    gd.ellipse([W // 2 - r, 40 - r, W // 2 + r, 40 + r],
               fill=(*GLOW, a))
glow = glow.filter(ImageFilter.GaussianBlur(80))
img = Image.alpha_composite(img.convert("RGBA"), glow).convert("RGB")

draw = ImageDraw.Draw(img)

# Pinwheel: 16 module centers evenly spaced on a circle. Module 1 at top.
cx, cy = W // 2, H // 2 + 30
centers = []
for i in range(N_MODULES):
    angle = (i / N_MODULES) * math.pi * 2 - math.pi / 2
    centers.append((
        cx + math.cos(angle) * RADIUS,
        cy + math.sin(angle) * RADIUS,
        MODULE_HUES[i]
    ))

# Draw each module's concept cloud as a Gaussian-spread blob of dots.
for mx, my, color in centers:
    for _ in range(CONCEPTS_PER_MODULE):
        # Normal-ish distribution via box-muller around the module center.
        u1, u2 = random.random(), random.random()
        if u1 < 1e-6:
            u1 = 1e-6
        rmag = math.sqrt(-2.0 * math.log(u1)) * (CLUSTER_R * 0.45)
        theta = 2 * math.pi * u2
        dx = rmag * math.cos(theta)
        dy = rmag * math.sin(theta)
        x = mx + dx
        y = my + dy
        # Vary dot size a touch so it doesn't look perfectly uniform.
        radius = 4 + random.random() * 3
        draw.ellipse([x - radius, y - radius, x + radius, y + radius],
                     fill=color)

# Brand row at the top.
brand_text = "AISE 26"
brand_font = font("segoeuib.ttf", 56)
b_bbox = draw.textbbox((0, 0), brand_text, font=brand_font)
b_w = b_bbox[2] - b_bbox[0]
draw.text(((W - b_w) // 2, 60), brand_text, fill=TEXT, font=brand_font)

# Subtitle.
sub = "The map of everything a 2026 AI Solutions Engineer needs."
sub_font = font("segoeui.ttf", 26)
s_bbox = draw.textbbox((0, 0), sub, font=sub_font)
s_w = s_bbox[2] - s_bbox[0]
draw.text(((W - s_w) // 2, 130), sub, fill=TEXT_2, font=sub_font)

# URL bottom.
url_font = font("consola.ttf", 32)
url_text = "aise.psyrcuit.com"
u_bbox = draw.textbbox((0, 0), url_text, font=url_font)
u_w = u_bbox[2] - u_bbox[0]
draw.text(((W - u_w) // 2, H - 90), url_text, fill=TEXT_2, font=url_font)

img.save("hero-map.png", "PNG", optimize=True)
img.convert("RGB").save(
    "hero-map.jpg", "JPEG",
    quality=90, optimize=False, progressive=False, subsampling=2,
)
print("hero-map.png + hero-map.jpg written - 1200x1200")
