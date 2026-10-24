#!/usr/bin/env bash
# Comparte tu sitio local por internet (un comando).
# Requisito: Apache encendido en XAMPP.
# Ejecutá ESTE script en la app Terminal y dejá la ventana abierta.

ROOT="$(cd "$(dirname "$0")" && pwd)"
CF="$ROOT/tools/cloudflared"
SUFFIX="/ProyectosTom-PHP/Terapia-Ancianos/"
LINK_FILE="$ROOT/LINK-PUBLICO.txt"

if ! curl -sf -o /dev/null "http://127.0.0.1${SUFFIX}"; then
  echo ""
  echo "Apache no responde. Abrí XAMPP y pulsá Start en Apache."
  echo ""
  exit 1
fi

if [[ ! -x "$CF" ]]; then
  echo ""
  echo "No se encontró tools/cloudflared."
  echo ""
  exit 1
fi

pkill -f "$CF tunnel" 2>/dev/null || true

echo ""
echo "Creando link público…"
echo "NO cierres esta ventana mientras tu hermano mira el sitio."
echo "Tip: evitá que la Mac se duerma (Ajustes → Pantalla / Energía)."
echo ""

"$CF" tunnel --url http://127.0.0.1:80 2>&1 | while IFS= read -r line; do
  echo "$line"
  if [[ "$line" == *trycloudflare.com* ]]; then
    url="$(echo "$line" | grep -oE 'https://[a-z0-9-]+\.trycloudflare\.com' | head -1)"
    if [[ -n "$url" ]]; then
      full="${url}${SUFFIX}"
      echo "$full" > "$LINK_FILE"
      echo ""
      echo "=============================================="
      echo "  LINK PARA COMPARTIR (WhatsApp, etc.):"
      echo "  $full"
      echo "=============================================="
      echo "  (También guardado en LINK-PUBLICO.txt)"
      echo ""
    fi
  fi
done
