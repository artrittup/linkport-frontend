#!/bin/sh
set -eu

api_base_url="${API_BASE_URL:-http://127.0.0.1:8000/api}"

case "$api_base_url" in
  http://*|https://*) ;;
  *)
    echo "API_BASE_URL must start with http:// or https://" >&2
    exit 1
    ;;
esac

if printf '%s' "$api_base_url" | grep -q '[[:cntrl:]]'; then
  echo "API_BASE_URL must not contain control characters" >&2
  exit 1
fi

escaped_api_base_url="$(printf '%s' "$api_base_url" | sed 's/\\/\\\\/g; s/"/\\"/g')"
config_file=/usr/share/nginx/html/runtime-config.js

printf 'window.__LINKPORT_CONFIG__ = Object.freeze({"apiBaseUrl":"%s"});\n' \
  "$escaped_api_base_url" > "$config_file"
