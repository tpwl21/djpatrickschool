#!/bin/sh
# Transforme une illustration Patrick (fond papier uni) en "autocollant" WebP 640px :
# fond détouré, liseré papier qui suit le contour, trait encre. L'ombre décalée est ajoutée en CSS.
# Usage : scripts/make-sticker.sh src/assets/_originals_backup/coach_patrick.png src/assets/coach_patrick.webp
# Requiert ImageMagick 7 (magick).
set -eu
in="$1"; out="$2"
tmp=$(mktemp -d); trap 'rm -rf "$tmp"' EXIT
w=$(magick identify -format %w "$in"); h=$(magick identify -format %h "$in")
x=$((w - 3)); y=$((h - 3)); mx=$((w / 2)); my=$((h / 2))

# 1. Détourage : remplissage depuis les bords (papier presque blanc) avec tolérance
magick "$in" -alpha set -fuzz 9% -fill none \
  -draw "color 2,2 floodfill" -draw "color $x,2 floodfill" -draw "color 2,$y floodfill" -draw "color $x,$y floodfill" \
  -draw "color $mx,2 floodfill" -draw "color $mx,$y floodfill" -draw "color 2,$my floodfill" -draw "color $x,$my floodfill" \
  -channel A -morphology Erode Disk:1.2 -blur 0x0.6 +channel "$tmp/cut.png"

# 2. Masque nettoyé : on retire les îlots de grain papier (< 40 px, les lettres restent) puis on recolle sur le détourage
magick "$tmp/cut.png" -alpha extract -threshold 50% \
  -define connected-components:area-threshold=40 -define connected-components:mean-color=true \
  -connected-components 8 "$tmp/clean.png"
magick "$tmp/cut.png" -alpha extract \( "$tmp/clean.png" -morphology Dilate Disk:2 \) -compose Multiply -composite "$tmp/alpha.png"
magick "$tmp/cut.png" -alpha off "$tmp/alpha.png" -compose CopyOpacity -composite \
  -compose Over -trim +repage -bordercolor none -border 30 "$tmp/cut2.png"

# 3. Liseré papier (dilatation du contour) + trait encre autour
magick "$tmp/cut2.png" -alpha extract -morphology Dilate Disk:14 -blur 0x1 -level 40%,60% "$tmp/paper.png"
magick "$tmp/paper.png" -morphology Dilate Disk:3 "$tmp/ink.png"
size=$(magick identify -format %wx%h "$tmp/paper.png")
magick \( -size "$size" xc:'#333333' "$tmp/ink.png" -alpha off -compose CopyOpacity -composite \) \
       \( -size "$size" xc:'#fbf9f4' "$tmp/paper.png" -alpha off -compose CopyOpacity -composite \) -compose Over -composite \
       "$tmp/cut2.png" -compose Over -composite \
  -trim +repage -resize 640x640 -quality 84 -define webp:alpha-quality=90 "$out"
echo "$out"
