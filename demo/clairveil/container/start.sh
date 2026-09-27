#!/usr/bin/env bash
set -euo pipefail
/opt/lab/check-cpu
mkdir -p /results /cache
if [[ "${LAB_UID:-}" =~ ^[0-9]+$ && "${LAB_GID:-}" =~ ^[0-9]+$ ]]; then
  trap 'chown -R "$LAB_UID:$LAB_GID" /results' EXIT
fi
run="/results/run-$(date +%Y%m%d-%H%M%S)-${RANDOM}"
args=()
if [ -f /results/latest-artifacts ] && [ -d "$(cat /results/latest-artifacts)" ]; then
  args+=(--artifacts "$(cat /results/latest-artifacts)")
fi
python3 /opt/lab/run-local.py --source /opt/clairveil --run-dir "$run" "${args[@]}"
if [ ${#args[@]} -eq 0 ]; then printf '%s\n' "$run/artifacts" > /results/latest-artifacts; fi
cp "$run/PUBLIC_RESULT.json" /results/PUBLIC_RESULT.json
printf '\n완료: .private/privacy-container/PUBLIC_RESULT.json\n'
