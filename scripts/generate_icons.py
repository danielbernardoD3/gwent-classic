import os
import shutil
from PIL import Image, ImageDraw, ImageFilter
import numpy as np
from collections import deque

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
SOURCE_ICON = r'D:\Teste\Appico.png'
APP_ICON_DEST = os.path.join(BASE_DIR, 'Appico.png')
ICO_DEST = os.path.join(BASE_DIR, 'app.ico')
RES_DIR = os.path.join(BASE_DIR, 'android', 'app', 'src', 'main', 'res')

print(f"Source icon: {SOURCE_ICON}")
print(f"Destination: {APP_ICON_DEST}")

# 1. Copy Appico.png to gwent-classic
shutil.copyfile(SOURCE_ICON, APP_ICON_DEST)

# 2. Open source image
orig_img = Image.open(SOURCE_ICON).convert('RGB')
w, h = orig_img.size
arr = np.array(orig_img)

# Flood-fill 4 corners to isolate the white exterior background
visited = np.zeros((h, w), dtype=bool)
q = deque([(0, 0), (0, w - 1), (h - 1, 0), (h - 1, w - 1)])
for y, x in q:
    visited[y, x] = True

while q:
    cy, cx = q.popleft()
    for dy, dx in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
        ny, nx = cy + dy, cx + dx
        if 0 <= ny < h and 0 <= nx < w and not visited[ny, nx]:
            # Threshold to consider as white background corner
            if np.mean(arr[ny, nx]) > 225:
                visited[ny, nx] = True
                q.append((ny, nx))

# Create smooth alpha mask
# Start with alpha 255 everywhere except visited
alpha = np.ones((h, w), dtype=np.uint8) * 255
alpha[visited] = 0

# Convert to PIL Image and smooth the edge slightly for anti-aliasing
alpha_img = Image.fromarray(alpha, mode='L')
# 1px blur on edge
alpha_blurred = alpha_img.filter(ImageFilter.GaussianBlur(radius=0.7))

# Combine with RGB image
clean_rgba = orig_img.convert('RGBA')
clean_rgba.putalpha(alpha_blurred)

print("Generated clean RGBA image with transparent squircle corners.")

# 3. Generate Windows app.ico with standard sizes
ico_sizes = [(16, 16), (24, 24), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
clean_rgba.save(ICO_DEST, format='ICO', sizes=ico_sizes)
print(f"Saved Windows multi-res icon: {ICO_DEST}")

# 4. Generate circular masked image for round icons
circle_mask = Image.new('L', (w, h), 0)
draw = ImageDraw.Draw(circle_mask)
draw.ellipse((0, 0, w, h), fill=255)
circle_mask = circle_mask.filter(ImageFilter.GaussianBlur(radius=0.7))

round_rgba = orig_img.convert('RGBA')
round_rgba.putalpha(circle_mask)

# 5. Densities for Android
densities = {
    'mdpi': {'launcher': 48, 'fg': 108},
    'hdpi': {'launcher': 72, 'fg': 162},
    'xhdpi': {'launcher': 96, 'fg': 216},
    'xxhdpi': {'launcher': 144, 'fg': 324},
    'xxxhdpi': {'launcher': 192, 'fg': 432}
}

for density, dims in densities.items():
    density_dir = os.path.join(RES_DIR, f'mipmap-{density}')
    os.makedirs(density_dir, exist_ok=True)
    
    # 5a. Legacy launcher icon (squircle with transparent corners)
    l_size = dims['launcher']
    launcher_img = clean_rgba.resize((l_size, l_size), Image.Resampling.LANCZOS)
    launcher_path = os.path.join(density_dir, 'ic_launcher.png')
    launcher_img.save(launcher_path, format='PNG')
    
    # 5b. Round launcher icon
    round_img = round_rgba.resize((l_size, l_size), Image.Resampling.LANCZOS)
    round_path = os.path.join(density_dir, 'ic_launcher_round.png')
    round_img.save(round_path, format='PNG')
    
    # 5c. Adaptive icon foreground (centered in safe zone, ratio ~0.70)
    fg_size = dims['fg']
    inner_size = int(round(fg_size * 0.72))
    offset = (fg_size - inner_size) // 2
    
    inner_scaled = clean_rgba.resize((inner_size, inner_size), Image.Resampling.LANCZOS)
    fg_canvas = Image.new('RGBA', (fg_size, fg_size), (0, 0, 0, 0))
    fg_canvas.paste(inner_scaled, (offset, offset), inner_scaled)
    
    fg_path = os.path.join(density_dir, 'ic_launcher_foreground.png')
    fg_canvas.save(fg_path, format='PNG')
    
    print(f"Generated mipmap-{density}: launcher={l_size}x{l_size}, round={l_size}x{l_size}, fg={fg_size}x{fg_size}")

# 6. Update background color in values/ic_launcher_background.xml
bg_xml_path = os.path.join(RES_DIR, 'values', 'ic_launcher_background.xml')
bg_xml_content = """<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#171310</color>
</resources>
"""
with open(bg_xml_path, 'w', encoding='utf-8') as f:
    f.write(bg_xml_content)
print(f"Updated {bg_xml_path} to Witcher dark tone #171310")

# 7. Remove obsolete Android robot vector templates if present
obsolete_fg = os.path.join(RES_DIR, 'drawable-v24', 'ic_launcher_foreground.xml')
if os.path.exists(obsolete_fg):
    os.remove(obsolete_fg)
    print(f"Removed obsolete vector template: {obsolete_fg}")

obsolete_bg = os.path.join(RES_DIR, 'drawable', 'ic_launcher_background.xml')
if os.path.exists(obsolete_bg):
    os.remove(obsolete_bg)
    print(f"Removed obsolete vector template: {obsolete_bg}")

print("All icons generated successfully!")

