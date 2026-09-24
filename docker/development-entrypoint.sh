#!/bin/sh
set -eu

image_lock_file=/opt/linkport-dependencies/package-lock.json
volume_marker=/workspace/node_modules/.linkport-lock-sha
image_lock="$(sha256sum "$image_lock_file" | cut -d ' ' -f 1)"

if [ ! -f "$volume_marker" ] || [ "$(cat "$volume_marker")" != "$image_lock" ]; then
  find /workspace/node_modules -mindepth 1 -maxdepth 1 -exec rm -rf {} +
  cp -a /opt/linkport-dependencies/node_modules/. /workspace/node_modules/
  printf '%s\n' "$image_lock" > "$volume_marker"
fi

exec "$@"
