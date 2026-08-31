#!/bin/bash
# Bundles Flip Tracker Pro into one self-contained HTML file for publishing as a Claude artifact.
# Icon fonts are embedded as data URIs (artifact CSP blocks unpkg); Inter stays on Google Fonts (allowed).
set -euo pipefail

APP="/c/Users/gersi/OneDrive/Documents/Claude Apps/Flip Tracker Pro/flip-tracker-pro"
PH="/c/Users/gersi/AppData/Local/Temp/claude/C--Users-gersi-OneDrive-Documents-Claude-Apps-Flip-Tracker-Pro-Screenshots-of-UI-from-Claude-Design/90bcbd64-383a-48ca-9584-98a74d6467fa/scratchpad/phosphor"
OUT="$APP/flip-tracker-pro.artifact.html"

REG_B64=$(base64 -w0 "$PH/Phosphor-regular.woff2")
FILL_B64=$(base64 -w0 "$PH/Phosphor-fill.woff2")

# Phosphor CSS with the multi-format src replaced by a single embedded woff2
perl -0777 -pe 's/src:\s*\n(?:\s*url\([^)]*\)[^,;]*,?\n?)+;/src: url("data:font\/woff2;base64,__REG__") format("woff2");/s' "$PH/regular.css" > /tmp/ph-reg.css
perl -0777 -pe 's/src:\s*\n(?:\s*url\([^)]*\)[^,;]*,?\n?)+;/src: url("data:font\/woff2;base64,__FILL__") format("woff2");/s' "$PH/fill.css" > /tmp/ph-fill.css
perl -pi -e "s|__REG__|$REG_B64|" /tmp/ph-reg.css
perl -pi -e "s|__FILL__|$FILL_B64|" /tmp/ph-fill.css

# Nocturne CSS without the @import (Google Fonts is linked directly instead)
grep -v "@import" "$APP/nocturne-styles.css" > /tmp/nocturne.css

# app-data.js with the download() helper swapped for a capability-aware version
perl -0777 -pe "s/\Qconst download = (name, content, mime) => { const b = new Blob([content], {type: mime||'text\/plain'}); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = name; document.body.appendChild(a); a.click(); setTimeout(()=>{URL.revokeObjectURL(a.href); a.remove();}, 400); };\E/const download = (name, content, mime) => { const fallback = () => { const b = new Blob([content], {type: mime||'text\/plain'}); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = name; document.body.appendChild(a); a.click(); setTimeout(()=>{URL.revokeObjectURL(a.href); a.remove();}, 400); }; if (window.claude \&\& window.claude.use) { window.claude.use('downloads').then(d => { if (d) d.save({filename: name, data: content}).catch(err => { if (err \&\& err.code === 'declined') return; fallback(); }); else fallback(); }).catch(fallback); } else fallback(); };/s" "$APP/app-data.js" > /tmp/app-data-patched.js

if ! grep -q "window.claude.use" /tmp/app-data-patched.js; then
  echo "ERROR: download() patch did not apply" >&2
  exit 1
fi

{
  echo '<title>Flip Tracker Pro</title>'
  echo '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">'
  echo '<link rel="preconnect" href="https://fonts.googleapis.com">'
  echo '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
  echo '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap">'
  echo '<style>'
  cat /tmp/ph-reg.css
  cat /tmp/ph-fill.css
  cat /tmp/nocturne.css
  cat "$APP/app.css"
  echo '</style>'
  echo '<div id="app"></div>'
  echo '<script>'
  cat /tmp/app-data-patched.js
  cat "$APP/app-core.js"
  cat "$APP/app-viewmodels.js"
  cat "$APP/app-render-shell.js"
  cat "$APP/app-render-screens.js"
  cat "$APP/app-render-modals.js"
  echo 'var app = new App(document.getElementById("app")); app.mount(); window.FTP_APP = app;'
  echo '</script>'
} > "$OUT"

echo "Built: $OUT ($(du -h "$OUT" | cut -f1))"
