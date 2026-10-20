---
name: file-upload
description: Add before/after screenshots and a screen recording to a GitHub PR or issue. Use when a PR needs visual proof, for example a UI change. GitHub only.
---

# File upload

Show the change instead of describing it: a before/after pair of screenshots,
plus a short recording when something moves. `gh --attach` uploads the files
to GitHub when it posts, so there is no script and no other host. Needs gh
2.99+ and write access to the repo.

## Capture

- Capture "before" before you change the code. If you already changed it, run
  the base branch from a separate `git worktree`. Never switch branches in the
  working checkout to get it.
- Capture before and after at the same viewport size and state, not
  full-page, so the pair lines up in a table.
- Record a video only when the change moves or responds to input. Skip it for
  a static change.
- Use T3 preview tools or Helium. Never Chrome.
- Nothing secret on screen: tokens, `.env` values, private data.

## Write and post

Put `body.md` and the media in one temporary folder and run `gh` from there.
gh resolves `./` paths against the body file's folder first, then the current
directory.

```markdown
| Before | After |
| --- | --- |
| ![Settings page before](./before.png) | ![Settings page after](./after.png) |

![Demo](./demo.mp4)
```

```bash
gh pr create --body-file body.md --attach ./before.png --attach ./after.png --attach ./demo.mp4
```

- gh swaps every `./` reference for the GitHub URL. A video must be written as
  `![...](./demo.mp4)` alone in its own paragraph to render as a player. A bare
  `./demo.mp4` line is not rewritten, and in a table or a sentence a video
  becomes a plain link.
- Attach at `gh pr create` when you can. `gh pr edit --body-file` replaces the
  whole body, so to add media later, start `body.md` from
  `gh pr view --json body -q .body` and add to it. `--attach` also works on
  `gh pr comment` and `gh issue create/edit/comment`.
- Limits: images up to 10 MB, videos up to 100 MB. Convert a `.mov`, or
  shrink a big video, with
  `ffmpeg -i in.mov -vf "scale=trunc(iw/2)*2:-2" -c:v libx264 -crf 28 -pix_fmt yuv420p demo.mp4`.
- If one upload fails, gh still posts the ones that worked and exits non-zero.
  Uploads cannot be deleted, so retry only the failed file.
- Without write access, for example a PR to someone else's repo, gh refuses.
  Post without media and tell Dhruv.
- Never attach media from a private repo to a public post.

## Check

Run `gh pr view --json body -q .body` and confirm no `./` paths are left and
the video URL sits alone on its own line. Then open the PR and confirm the
images show and the video plays.
