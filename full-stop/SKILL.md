---
name: full-stop
description: Use when Dhruv explicitly asks for "full stop"
---

# Full Stop

Dhruv is not watching. Own the work until the PR is ready for Dhruv to merge.
Keep fixing, verifying, and reviewing. Never merge it.

## Authority and boundary

You may commit, push, rebase, fix conflicts, and use `--force-with-lease` on
this task's branch. Open or update a real PR, mark a draft ready, and keep
its description current. Preserve unrelated work and stay within scope.

Never merge, enable auto-merge, enter a merge queue, push to the default
branch, bypass branch protection, or delegate any of those actions.
Disable existing auto-merge and remove the PR from any merge queue before
you hand off.

## Steps

1. **Finish the change.** Complete the goal from Dhruv's request with the
   smallest change that works. If you are on the default branch, create a
   branch first.
2. **Prove it.** Get proof for every change you made. See "Proof".
3. **File the PR** with the `file-pr` skill. Rebase onto the latest default
   branch first. Add one short line to the description that says how you
   proved the change.
4. **Get it reviewed** by other models with the `sol-loop` skill. Fix real
   findings, prove each fix, and push it.
5. **Babysit the PR** with the `babysit-pr` skill. Handle CI failures, bot
   findings, and teammates' reviews. Prove each fix before you push it.
6. **Hand off** to Dhruv. See "Final check and handoff".

Stay active from step 1 to step 6. If you end your turn while checks or bots
are pending, the work stops, because nobody will prompt you again. Wait with
the watcher from `babysit-pr`. In T3 Code that is `watch_pull_request`.

## Proof

Proof is evidence you observed yourself in this session: command output, a
reproduction, a screenshot. Reproduce the failure and watch the fix pass, run
the checks the repo's CI runs, and run the app for UI and runtime changes.
Green mocked tests do not prove that the user experience works. Attach
screenshots with the `file-upload` skill when they help.

## Asking Dhruv

A question in a normal message goes unseen. Use the harness's question tool
(`AskUserQuestion` in Claude Code, `request_user_input_async` in Codex) and
put the PR link, the blocker, and your recommended option in it. Ask only
when you cannot prove the change, the final check cannot pass and you cannot
fix it, the next step is outside the grant above, the goal is ambiguous in a
way that changes the result, or another PR makes this one obsolete.

Decide everything else yourself with sensible defaults, and list those
decisions in the report. If no question tool is available, or the tool
returns no answer, take the safe path: stop with the PR open and unmerged,
call `unwatch_pull_request`, and start your final message with the
question. Never treat silence as permission to merge, and never ask Dhruv
to merge something that fails the final check.

## Final check and handoff

Check the live PR on GitHub, not your local state. The PR is ready for Dhruv
only when all of these are true on the latest pushed commit. If any of them
fails, go back to the steps: fix it, prove the fix, push, and review again.
Do not hand off a PR that you know still needs work from you.

- Your proof covers every change in the diff, and the description says how
  you proved it. Screenshots or recordings are attached for UI changes,
  with `file-upload`. The description matches the final diff and the PR
  is marked ready, not a draft.
- Required checks are green. Every failure is fixed, or proven to be an
  infrastructure flake by a passing rerun.
- Review bots and Sol have finished, each finding is fixed or dismissed with
  a reason, no human requests changes, and GitHub reports it as MERGEABLE.

A bot that only asks for a human review is not a blocker. Note it in the
report. Auto-merge stays off, and the PR stays out of any merge queue. Then
stop working: no new commits, no new comments, no extra polish.

Before the report or a question, call `unwatch_pull_request` so nothing wakes
you again on this PR. Leave the PR open, ready, and unmerged.

Report briefly: PR link, final head, and GitHub's mergeable state, then one
bullet per check or reviewer. Say that you stopped watching and did not merge.
