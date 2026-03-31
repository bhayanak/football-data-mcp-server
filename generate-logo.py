#!/usr/bin/env python3
"""Generate a modern football + MCP data logo (256x256 PNG)."""
import math
import os
from PIL import Image, ImageDraw, ImageFont

SIZE = 256
CX, CY = SIZE // 2, SIZE // 2 - 6
BALL_R = 52

img = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)

# ── Helpers ──────────────────────────────────────────
def rounded_rect(d, xy, r, fill):
    x0, y0, x1, y1 = xy
    d.rectangle([x0 + r, y0, x1 - r, y1], fill=fill)
    d.rectangle([x0, y0 + r, x1, y1 - r], fill=fill)
    d.pieslice([x0, y0, x0 + 2*r, y0 + 2*r], 180, 270, fill=fill)
    d.pieslice([x1 - 2*r, y0, x1, y0 + 2*r], 270, 360, fill=fill)
    d.pieslice([x0, y1 - 2*r, x0 + 2*r, y1], 90, 180, fill=fill)
    d.pieslice([x1 - 2*r, y1 - 2*r, x1, y1], 0, 90, fill=fill)

def polygon_pts(cx, cy, r, n, rot=0):
    return [(cx + r * math.cos(rot + i * 2 * math.pi / n - math.pi/2),
             cy + r * math.sin(rot + i * 2 * math.pi / n - math.pi/2)) for i in range(n)]

# ── 1. Background ────────────────────────────────────
rounded_rect(draw, (0, 0, SIZE-1, SIZE-1), 36, (15, 23, 42, 255))

# Lighter center area
center_glow = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
cgd = ImageDraw.Draw(center_glow)
for r in range(100, 0, -1):
    a = int(8 * (1 - r/100))
    cgd.ellipse([CX-r, CY-r, CX+r, CY+r], fill=(30, 41, 59, a))
img = Image.alpha_composite(img, center_glow)
draw = ImageDraw.Draw(img)

# ── 2. Subtle dot grid ──────────────────────────────
for gx in range(20, SIZE, 20):
    for gy in range(20, SIZE, 20):
        dist = math.sqrt((gx - CX)**2 + (gy - CY)**2)
        a = int(max(4, 18 * max(0, 1 - dist / 120)))
        draw.ellipse([gx-1, gy-1, gx+1, gy+1], fill=(56, 189, 248, a))

# ── 3. Glow behind ball ─────────────────────────────
glow = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
gd = ImageDraw.Draw(glow)
for r in range(100, 0, -1):
    t = r / 100
    a = int(18 * (1 - t))
    rc = int(16 + 40 * t)
    gc = int(185 - 50 * t)
    bc = int(129 + 119 * t)
    gd.ellipse([CX-r, CY-r, CX+r, CY+r], fill=(rc, gc, bc, a))
img = Image.alpha_composite(img, glow)
draw = ImageDraw.Draw(img)

# ── 4. Football ──────────────────────────────────────
ball = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
bd = ImageDraw.Draw(ball)

# Base white ball
bd.ellipse([CX-BALL_R, CY-BALL_R, CX+BALL_R, CY+BALL_R], fill=(245, 248, 252, 255))

# 3D shading using pixel-level distance from light source
light_x, light_y = CX - 18, CY - 18
shade = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
for y in range(CY - BALL_R, CY + BALL_R + 1):
    for x in range(CX - BALL_R, CX + BALL_R + 1):
        dx, dy = x - CX, y - CY
        dist_from_center = math.sqrt(dx*dx + dy*dy)
        if dist_from_center > BALL_R:
            continue
        # Distance from light source, normalized
        ldx, ldy = x - light_x, y - light_y
        light_dist = math.sqrt(ldx*ldx + ldy*ldy)
        max_light_dist = BALL_R * 2.2
        t = min(light_dist / max_light_dist, 1.0)
        # Edge darkening
        edge_t = dist_from_center / BALL_R
        edge_dark = edge_t * edge_t * 0.4
        # Combined darkness
        darkness = min(int((t * 0.35 + edge_dark) * 120), 100)
        shade.putpixel((x, y), (30, 41, 59, darkness))

ball = Image.alpha_composite(ball, shade)
bd = ImageDraw.Draw(ball)

# Specular highlight
for hr in range(16, 0, -1):
    a = int(70 * (1 - hr/16))
    bx, by = CX - 18, CY - 20
    bd.ellipse([bx-hr, by-hr, bx+hr, by+hr], fill=(255, 255, 255, a))

# Crisp border
bd.ellipse([CX-BALL_R, CY-BALL_R, CX+BALL_R, CY+BALL_R],
           outline=(51, 65, 85, 160), width=2)

img = Image.alpha_composite(img, ball)
draw = ImageDraw.Draw(img)

# ── 5. Pentagon pattern ──────────────────────────────
pent_fill = (30, 41, 59, 170)
pent_outline = (30, 41, 59, 110)
line_color = (30, 41, 59, 80)

# Center pentagon (filled dark)
cp = polygon_pts(CX, CY, 14, 5, 0)
draw.polygon(cp, fill=pent_fill, outline=(30, 41, 59, 190))

# 5 outer pentagons
outer_d = 35
outer_pents = []
for i in range(5):
    angle = (i * 2 * math.pi / 5) - math.pi / 2
    ox = CX + outer_d * math.cos(angle)
    oy = CY + outer_d * math.sin(angle)
    pts = polygon_pts(ox, oy, 10, 5, math.pi / 5)
    outer_pents.append((ox, oy, pts))
    draw.polygon(pts, outline=pent_outline)

# Lines from center vertices to outer pentagons
for i in range(5):
    draw.line([cp[i], (outer_pents[i][0], outer_pents[i][1])],
              fill=line_color, width=1)

# Lines connecting adjacent outer pentagons
for i in range(5):
    j = (i + 1) % 5
    pi_pts = outer_pents[i][2]
    pj_pts = outer_pents[j][2]
    best_d = 9999
    best_pair = (pi_pts[0], pj_pts[0])
    for p1 in pi_pts:
        for p2 in pj_pts:
            d = math.sqrt((p1[0]-p2[0])**2 + (p1[1]-p2[1])**2)
            if d < best_d:
                best_d = d
                best_pair = (p1, p2)
    draw.line(best_pair, fill=line_color, width=1)

# ── 6. Data connection nodes ─────────────────────────
nodes = [
    (38, 38, (56, 189, 248)),
    (218, 38, (34, 211, 238)),
    (32, 202, (16, 185, 129)),
    (224, 202, (99, 102, 241)),
]

node_layer = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
nd = ImageDraw.Draw(node_layer)

for nx, ny, nc in nodes:
    angle = math.atan2(CY - ny, CX - nx)
    ex = CX - (BALL_R + 8) * math.cos(angle)
    ey = CY - (BALL_R + 8) * math.sin(angle)
    length = math.sqrt((ex - nx)**2 + (ey - ny)**2)

    seg, gap = 6, 4
    steps = int(length / (seg + gap))
    for s in range(steps):
        frac = s / max(steps - 1, 1)
        t0 = s * (seg + gap) / length
        t1 = min(t0 + seg / length, 1.0)
        x0 = nx + (ex - nx) * t0
        y0 = ny + (ey - ny) * t0
        x1 = nx + (ex - nx) * t1
        y1 = ny + (ey - ny) * t1
        a = int(200 * (1 - frac * 0.7))
        nd.line([(x0, y0), (x1, y1)], fill=(*nc, a), width=2)

    # Node glow
    for gr in range(16, 0, -1):
        a = int(28 * (1 - gr/16))
        nd.ellipse([nx-gr, ny-gr, nx+gr, ny+gr], fill=(*nc, a))

    # Node circle
    nd.ellipse([nx-5, ny-5, nx+5, ny+5], fill=(*nc, 240))
    nd.ellipse([nx-5, ny-5, nx+5, ny+5], outline=(255, 255, 255, 70), width=1)
    nd.ellipse([nx-2, ny-2, nx+2, ny+2], fill=(255, 255, 255, 170))

img = Image.alpha_composite(img, node_layer)
draw = ImageDraw.Draw(img)

# ── 7. Floating data particles ───────────────────────
particles = [
    (72, 76, 2.0), (186, 70, 1.8), (58, 156, 2.2),
    (198, 160, 1.8), (105, 32, 1.5), (155, 27, 1.8),
    (42, 118, 1.3), (214, 122, 1.5), (88, 212, 1.8),
    (168, 218, 1.5), (128, 224, 1.2),
]
for px, py, ps in particles:
    dist = math.sqrt((px-CX)**2 + (py-CY)**2)
    a = int(max(40, 100 - dist * 0.5))
    draw.ellipse([px-ps, py-ps, px+ps, py+ps], fill=(16, 185, 129, a))

# ── 8. "MCP" text ────────────────────────────────────
font_paths = [
    "/System/Library/Fonts/SFNSMono.ttf",
    "/System/Library/Fonts/Menlo.ttc",
    "/System/Library/Fonts/Supplemental/Menlo.ttc",
    "/System/Library/Fonts/Monaco.ttf",
    "/System/Library/Fonts/Supplemental/Monaco.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf",
]
font = None
for fp in font_paths:
    if os.path.exists(fp):
        try:
            font = ImageFont.truetype(fp, 19)
            break
        except Exception:
            continue
if font is None:
    font = ImageFont.load_default()

text = "MCP"
mcp_y = SIZE - 25
bbox = draw.textbbox((0, 0), text, font=font)
tw = bbox[2] - bbox[0]
tx = CX - tw // 2

# Text shadow
draw.text((tx + 1, mcp_y + 1), text, font=font, fill=(0, 0, 0, 50))

# Each letter with cyan→teal→green gradient
colors = [(56, 189, 248), (34, 197, 171), (16, 185, 129)]
x_pos = tx
for ch, col in zip(text, colors):
    draw.text((x_pos, mcp_y), ch, font=font, fill=(*col, 230))
    ch_w = draw.textbbox((0, 0), ch, font=font)[2] - draw.textbbox((0, 0), ch, font=font)[0]
    x_pos += ch_w + 1

# ── 9. Corner brackets (tech feel) ───────────────────
bc = (56, 189, 248, 45)
bl = 16
draw.line([(12, 12), (12 + bl, 12)], fill=bc, width=1)
draw.line([(12, 12), (12, 12 + bl)], fill=bc, width=1)
draw.line([(SIZE-12, 12), (SIZE-12-bl, 12)], fill=bc, width=1)
draw.line([(SIZE-12, 12), (SIZE-12, 12+bl)], fill=bc, width=1)
draw.line([(12, SIZE-12), (12+bl, SIZE-12)], fill=bc, width=1)
draw.line([(12, SIZE-12), (12, SIZE-12-bl)], fill=bc, width=1)
draw.line([(SIZE-12, SIZE-12), (SIZE-12-bl, SIZE-12)], fill=bc, width=1)
draw.line([(SIZE-12, SIZE-12), (SIZE-12, SIZE-12-bl)], fill=bc, width=1)

# ── Save ─────────────────────────────────────────────
script_dir = os.path.dirname(os.path.abspath(__file__))
for pkg in ["football-data-server", "football-data-vscode-extension"]:
    out = os.path.join(script_dir, "packages", pkg, "logo.png")
    img.save(out, "PNG", optimize=True)
    sz = os.path.getsize(out)
    print(f"Saved {out} ({sz} bytes)")
