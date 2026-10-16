---
name: file-upload
description: When user asks to upload a file, or one is needed for PR descriptions, use skill.
---

# File upload

Upload images and videos to GitHub with `upload.sh` in this skill's folder,
then embed the URL it prints. It uses the `gh` login and works in any GitHub
repo, including ones you cannot write to.

## Upload

```bash
<this-skill-dir>/upload.sh <path-to-file> <owner/repo>
```

- Pass the repo where the URL will be posted. With write access there, the
  file uploads against that repo and keeps its visibility, so a private repo's
  media stays private. Without write access, it uploads against
  `Dhruv2mars/media` and becomes public once posted.
- The URL returns 404 until a post references it. That is expected.
- Images: png, jpg, gif, webp, svg, up to 10 MB. Videos: mp4, mov, webm, up
  to 100 MB.
- On failure, report the script's error. Do not try another host.
- Never upload secrets, `.env` files, or private logs. Never post media from a
  private repo into a public one.
- The URL only works on GitHub. If the file is for somewhere else, ask Dhruv.

## Use the URL in GitHub

- Embed images as `![description](URL)`.
- Put a video URL alone in its own paragraph. GitHub renders it as a player.
  Inside a sentence it becomes a plain link.
- For UI changes, show before and after.
