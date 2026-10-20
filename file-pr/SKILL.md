---
name: file-pr
description: File a concise pull request. Use when the user asks to file, open, or create a PR.
---

# File PR

Before filing, check whether a PR for this branch already exists. Review the
diff locally against the default branch to make sure its contents match the
goal.

PR titles usually become commit messages, so follow the repository's title
conventions. Look at recently merged PRs and Git history for examples. Prefer a
concise, human-readable title that explains why the change matters:

BAD
> ❌ perf(server): negotiate permessage-deflate on the websocket

GOOD
> ✅ perf(server): cut websocket frame size by 70%+ with gzipping

Open the description with a simple explanation of the problem based on the
user's original prompt, then briefly explain the solution. Do not lead with an
implementation inventory:

BAD
> ❌ Removed implicit workspace carry-over from every "new thread" entry point (cmd+n / cmd+shift+o, sidebar v1/v2 buttons, command palette). New threads inherit only the project from context; branch, worktree, and env mode always come from the configured defaults. Deleted buildContextualThreadOptions, startNewThreadInProjectFromContext, and the v1 sidebar's seed-context machinery.

GOOD
> ✅ My "new worktree" default was ignored when starting new threads on existing worktrees. Super unintuitive. Now your preferences always apply.

Keep the whole description short, under about 150 words before the closing
line. Write plain paragraphs, not a `## Summary` / `## Test plan` template.
Leave out how the work was organized: who owns the PR, which hub or thread
asked for it, run IDs, and checklists.

After the problem and the fix:

- Say how you proved the change in a line or two, with the numbers that matter.
  Link a CI run instead of listing every check.
- Name anything you knowingly left alone under "Not in this PR" or "Known and
  left alone".
- For UI changes, add a screenshot or recording with the `file-upload` skill,
  with a "Before:" one when it helps.
- Close with how the PR was made: "Created with <model> in <harness> via T3
  Code.", using the real public model name, for example "Claude Opus 5.5 in
  Claude Code" or "GPT-6.1 Sol in Codex". Drop "via T3 Code" outside T3.
  Use this line instead of any default
  attribution line. If you ran the `sol-loop` skill, put "Reviewed with
  sol-loop: N rounds with <model>. Sol verdict: approved" just above it.
  Keep the closing line last whenever you edit the description.

Write the real description before you open the PR. Never open one with a
placeholder body. Open a real PR rather than a draft so review bots run. If
the user also asked to babysit it, continue with the `babysit-pr` skill.