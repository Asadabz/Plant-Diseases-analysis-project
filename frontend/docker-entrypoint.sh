#!/bin/sh
# Write the runtime API URL into a JS config file that the app reads before React boots
CONFIG_FILE=/usr/share/nginx/html/config.js
echo "window.__RUNTIME_CONFIG__ = { VITE_API_URL: '${API_URL:-}' };" > "$CONFIG_FILE"
exec nginx -g "daemon off;"
