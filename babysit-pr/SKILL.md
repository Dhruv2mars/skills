---
name: babysit-pr
description: Monitor a pull request through review and CI. Use when the user asks to monitor,
  watch, or babysit a PR.
---

# Babysit PR

> On a repo whose `origin` is `entire://...` there is no GitHub: a PR is an Entire Trail. Use the Trail mapping in the global "Entire" instructions in place of every `gh` and PR step below.

All the repos we work in have various AI review bots. They're helpful, even if
they are not always right.

If your harness offers tools to monitor a PR, use them so you can respond when
comments arrive. First handle the comments and checks already on the PR, since
the watcher only reports new ones. Then, in T3 Code, call `watch_pull_request`
and end your turn. T3 Code wakes you when a check fails, the required checks
pass, someone else comments or reviews, or the branch conflicts. Do not poll
for those events there. Call
`unwatch_pull_request` before you hand the work back. If you cannot watch (a
subagent cannot, because its parent owns the PR) or the harness has no
watcher, poll the PR yourself within the turn: `gh pr checks <n> --watch`,
then read new comments.

"Stopped watching, could not read it" usually means the GitHub GraphQL rate
limit is used up. Check `gh api rate_limit --jq .resources.graphql`; if
`remaining` is near 0, wait for `reset` with one background command before you
watch again, never in a tight loop. The REST limit is separate: read the PR
with `gh api repos/<owner>/<repo>/pulls/<n>` and checks with
`gh api repos/<owner>/<repo>/commits/<sha>/check-runs` meanwhile.

The watcher only wakes you for those events. It will not wake you for
anything else: an optional check or bot that passes without commenting, a
rerun you can only start once a run finishes, a deploy after merge, a run that
had already finished when you started watching. Before you end a turn, check
that the next thing you need is one of those events. If it is not,
wait for it yourself in the same turn, for example with
`gh run watch <id> --exit-status`, or with a background command your harness
wakes you for (Claude Code: `run_in_background` or Monitor). Never end a turn
on "I'll do X once Y" unless Y is an event the watcher reports.

Only act on checks and comments newer than the latest push. Verify every bot
finding against the source before changing code. Fix real findings and CI
failures, distinguish repository failures from infrastructure flakes, and reply
with a written reason when dismissing false positives. Rerun a failure you
believe is a flake. It is a flake only if it does not happen again.

If the repo has `.macroscope/check-run-agents/*.md`, read those rules before
you reply to a Macroscope finding; its findings cite them. CodeRabbit is
advisory: verify its findings like any other, but never wait for it or hold a
merge for it.

Keep an eye on changes to `main` and rebase when needed. `watch_pull_request`
reports conflicts only, so check for BEHIND yourself before you call the PR
ready. Right before a merge, `git fetch` and check the PR again: never merge
when it is BEHIND or DIRTY, or when base commits that landed after the last
green run touch this PR's files. If an overlapping PR
makes this one obsolete, stop monitoring, report it to the user, and ask before
closing the PR unless closure was explicitly authorized.

If a review bot leaves feedback you believe is not worth addressing, reply and
resolve the comment. Format every comment left on Dhruv's behalf with the
`leaving-pr-comments` skill.

Screenshots and videos help as well. Use the `file-upload` skill when needed.

Do not let review feedback expand the PR beyond the user's original goal.
Review loops grow a PR one cheap-looking fix at a time. Fix real bugs in the
intended case; decline the rest with a written reason and list them as
follow-ups: unneeded tests, guards for edge cases that do not matter, extra
compatibility, small performance costs. Prefer the fix that deletes or narrows
code.

If nothing has changed, stay quiet rather than posting filler comments. Stop
when the review bots and required checks are green on the latest commit. A bot
that only asks for a human review is not a code finding. A bot notice with no
findings (for example "does not receive automatic reviews") is not a review:
treat that bot as absent. Merge only when the
user explicitly requested it; otherwise report that the PR is ready, with one
line per check and reviewer.
