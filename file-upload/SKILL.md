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
- Capture before and after in the same window at the same size and state, so
  the pair lines up in a table.
- Record a video only when the change moves or responds to input. Skip it for
  a static change.
- Use computer use to drive whatever changed: a web page in its own Helium
  window, a desktop app, or a CLI in a terminal. Never Chrome.
- Save the media with macOS `screencapture` on that one window. It captures at
  the screen's real resolution, even when other windows cover it. Find the
  window's id and size:

  ```bash
  swift -e 'import CoreGraphics
  for w in CGWindowListCopyWindowInfo(.optionOnScreenOnly, kCGNullWindowID) as! [[String: Any]] where w["kCGWindowLayer"] as! Int == 0 {
    let b = w["kCGWindowBounds"] as! [String: Any]
    print(w["kCGWindowNumber"]!, w["kCGWindowOwnerName"]!, b["Width"]!, b["Height"]!, w["kCGWindowName"] ?? "")
  }'
  ```

  Then `screencapture -x -o -l<id> after.png` for a still. For a video, start
  `screencapture -x -o -v -l<id> demo.mov &`, do the steps with computer use,
  and stop it with `kill -INT` on that process. Don't add `-V`: a recording
  with a time limit ignores the stop and runs to the end.
- Only the app on screen: no other tabs, no secrets, tokens, `.env` values or
  private data.

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
- Limits: images up to 10 MB, videos up to 100 MB. Convert the `.mov` with
  `ffmpeg -i demo.mov -vf "scale=trunc(iw/2)*2:-2" -c:v libx264 -crf 18 -pix_fmt yuv420p demo.mp4`.
  Raise `-crf` only if the file is too big, because higher values blur text.
- If one upload fails, gh still posts the ones that worked and exits non-zero.
  Uploads cannot be deleted, so retry only the failed file.
- Without write access, for example a PR to someone else's repo, gh refuses.
  Post without media and tell Dhruv.
- Never attach media from a private repo to a public post.

## Check

Run `gh pr view --json body -q .body` and confirm no `./` paths are left and
the video URL sits alone on its own line. Then open the PR and confirm the
images show with sharp text and the video plays.
