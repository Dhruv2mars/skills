---
name: babysit-pr
description: Monitor a pull request through review and CI. Use when the user asks to monitor,
  watch, or babysit a PR.
---

# Babysit PR

All the repos we work in have various AI review bots. They're helpful, even if
they are not always right.

If your harness offers tools to monitor a PR, use them so you can respond when
comments arrive. In T3 Code, call `watch_pull_request` and end your turn. T3
Code wakes you when checks finish, someone comments, or the branch conflicts.
Do not poll or run your own watcher there. Call `unwatch_pull_request` before
you hand the work back. Otherwise, poll the PR for new comments and checks.

Only act on checks and comments newer than the latest push. Verify every bot
finding against the source before changing code. Fix real findings and CI
failures, distinguish repository failures from infrastructure flakes, and reply
with a written reason when dismissing false positives. Rerun a failure you
believe is a flake. It is a flake only if it does not happen again.

Keep an eye on changes to `main` and rebase when needed. If an overlapping PR
makes this one obsolete, stop monitoring, report it to the user, and ask before
closing the PR unless closure was explicitly authorized.

If a review bot leaves feedback you believe is not worth addressing, reply and
resolve the comment. Format every comment left on Dhruv's behalf with the
`leaving-pr-comments` skill.

Screenshots and videos help as well. Use the `file-upload` skill when needed.

Do not let review feedback expand the PR beyond the user's original goal.
Address real shortcomings, but avoid scope creep.

If nothing has changed, stay quiet rather than posting filler comments. Stop
when the review bots and required checks are green on the latest commit. A bot
that only asks for a human review is not a code finding. Merge only when the
user explicitly requested it; otherwise report that the PR is ready, with one
line per check and reviewer.
