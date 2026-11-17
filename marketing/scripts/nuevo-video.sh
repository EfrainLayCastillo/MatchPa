#!/bin/sh
# Crea videos/<slug> desde la plantilla con fuentes, sonidos, música y capturas ya copiados.
#   sh scripts/nuevo-video.sh 2026-11-02-mi-pieza
set -e
SLUG="$1"
[ -n "$SLUG" ] || { echo "Uso: sh scripts/nuevo-video.sh AAAA-MM-DD-slug"; exit 1; }
cd "$(dirname "$0")/.."
DEST="videos/$SLUG"
[ ! -e "$DEST" ] || { echo "$DEST ya existe"; exit 1; }
cp -R videos/_plantilla-reel "$DEST"
NAME="${SLUG#????-??-??-}"
sed -i '' "s/plantilla-reel/$NAME/g" "$DEST/package.json" "$DEST/meta.json"
mkdir -p "$DEST/assets/audio" "$DEST/assets/fonts" "$DEST/assets/vo"
cp assets/sfx/*.mp3 "$DEST/assets/audio/"
cp assets/fonts/* "$DEST/assets/fonts/"
cp assets/musica/* "$DEST/assets/audio/" 2>/dev/null || true
cp assets/marca/*.png "$DEST/assets/"
[ -f "guiones/$SLUG.md" ] || cp guiones/_plantilla.md "guiones/$SLUG.md"
echo "Listo: $DEST. Siguiente: node scripts/vo.mjs $SLUG"
