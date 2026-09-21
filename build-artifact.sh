#!/bin/bash
# Bundles Flip Tracker Pro into one self-contained HTML file for publishing as a Claude artifact.
# Icon fonts are embedded as data URIs (artifact CSP blocks unpkg); Inter stays on Google Fonts (allowed).
set -euo pipefail

APP="/c/Users/gersi/OneDrive/Documents/Claude Apps/Flip Tracker Pro/flip-tracker-pro"
OUT="$APP/flip-tracker-pro.artifact.html"

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
  cat "$APP/phosphor-embedded.css"
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
