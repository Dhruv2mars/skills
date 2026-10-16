#!/usr/bin/env bash
# Upload an image or video to GitHub and print its URL.
# Usage: upload.sh <file> [owner/repo where the URL will be posted]
set -euo pipefail

file=${1:?usage: upload.sh <file> [owner/repo]}
dest=${2:-}
media=${FILE_UPLOAD_REPO:-Dhruv2mars/media}

[ -s "$file" ] || { echo "upload.sh: not a non-empty file: $file" >&2; exit 1; }

ext=$(printf '%s' "${file##*.}" | tr '[:upper:]' '[:lower:]')
case $ext in
  png) type=image/png ;;
  jpg | jpeg) type=image/jpeg ;;
  gif) type=image/gif ;;
  webp) type=image/webp ;;
  svg) type=image/svg+xml ;;
  mp4) type=video/mp4 ;;
  mov) type=video/quicktime ;;
  webm) type=video/webm ;;
  *) echo "upload.sh: .$ext is not supported (png jpg gif webp svg mp4 mov webm)" >&2; exit 1 ;;
esac

# GitHub's limits: 10 MB for images, 100 MB for videos.
case $type in image/*) max=10 ;; *) max=100 ;; esac
size=$(wc -c <"$file" | tr -d ' ')
[ "$size" -le $((max * 1024 * 1024)) ] || { echo "upload.sh: $file is over $max MB" >&2; exit 1; }

# Upload against the destination repo when we can write to it, so the file
# keeps that repo's visibility. Otherwise use the public media repo.
target=$media
if [ -n "$dest" ]; then
  read -r perm private < <(gh api graphql \
    -f query='query($o:String!,$n:String!){repository(owner:$o,name:$n){viewerPermission isPrivate}}' \
    -f o="${dest%%/*}" -f n="${dest#*/}" \
    -q '.data.repository | "\(.viewerPermission) \(.isPrivate)"')
  case $perm in
    ADMIN | MAINTAIN | WRITE) target=$dest ;;
    *) [ "$private" = false ] || { echo "upload.sh: $dest is private and you cannot write to it" >&2; exit 1; } ;;
  esac
fi

id=$(gh api "repos/$target" -q .id)
name=$(basename "$file" | tr -c 'A-Za-z0-9._\n-' '-')

resp=$(curl -sS --fail-with-body -X POST \
  "https://uploads.github.com/user-attachments/assets?name=$name&content_type=$type&repository_id=$id" \
  -H "Authorization: Bearer $(gh auth token)" \
  -H "Accept: application/vnd.github+json" \
  -H "Content-Type: application/octet-stream" \
  --data-binary @"$file") || { echo "upload.sh: upload failed: $resp" >&2; exit 1; }

url=$(printf '%s' "$resp" | sed -n 's/.*"url":"\([^"]*\)".*/\1/p')
[ -n "$url" ] || { echo "upload.sh: no URL in response: $resp" >&2; exit 1; }
echo "$url"
