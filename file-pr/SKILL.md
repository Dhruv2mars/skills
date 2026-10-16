---
name: file-pr
description: File a concise pull request. Use when the user asks to file, open, or create a PR.
---

# File PR

Before filing, check whether a PR for this branch already exists. Review the
diff locally against `origin/main` to make sure its contents match the goal.

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

After the problem and the fix:

- Say how you proved the change in a line or two, with the numbers that matter.
- Name anything you knowingly left alone under "Not in this PR" or "Known and
  left alone".
- For UI changes, add a screenshot or recording with the `file-upload` skill,
  with a "Before:" one when it helps.
- Close with how the PR was made, for example: "Created with Claude Opus 5.5 in
  Claude Code via T3 Code." If you ran the `sol-loop` skill, add "Reviewed with
  sol-loop: N rounds with GPT-6.1 Sol. Sol verdict: approved".

Open a real PR rather than a draft so review bots run. If the user also asked
to babysit it, continue with the `babysit-pr` skill.