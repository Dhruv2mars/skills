---
name: full-stop
description: Take work to a verified, reviewed PR that Dhruv can merge, then stop without merging. Use whenever a message says "full stop" as a request, typed by Dhruv or written in a brief by another agent, not when Dhruv asks you to stop working.
---

# Full Stop

Dhruv is not watching. Own the work until the PR is ready for Dhruv to merge.
Keep fixing, verifying, and reviewing. Never merge it. Your updates and your
final message go unread until long after you stop.

If Dhruv did not explicitly request "full stop" in some clear way, do not
assume full autonomy. If he did, everything below applies.

## Authority

You may commit, push, rebase, fix conflicts, and use `--force-with-lease` on
this task's branch. Open or update a real PR, mark a draft ready, and keep its
description current. Preserve unrelated work and stay within scope.

Never merge, enable auto-merge, enter a merge queue, push to the default
branch, force-push any other branch, bypass branch protection, or delegate any
of those actions. Disable existing auto-merge and remove the PR from any merge
queue before you hand off.

## Steps

1. **Finish the change.** Complete the goal from the request with the smallest
   change that works. Fix the case that happened, not every case that could.
   If you are on the default branch, create a branch first. Commit as you go
   and push the branch at each milestone, so a resumed thread can pick the
   work up if this one dies.
2. **Prove it.** Get proof for every change you made. See "Proof".
3. **File the PR** with the `file-pr` skill. Rebase onto the latest default
   branch first. Add one short line to the description that says how you proved
   the change.
4. **Get it reviewed.** Run the `sol-loop` skill and watch the PR with the
   `babysit-pr` skill at the same time, so Sol and the repo's AI review bots
   review in parallel. See "Review".
5. **Hand off** to Dhruv when the ready check passes. See "Ready check and
   handoff".
6. **Report.** See "Report".

If the goal needs several PRs, run steps 2 to 5 for each one, and hand them
all off together.

Stay active from step 1 to step 6. If you end your turn while checks, bots or
Sol are pending, the work stops, because nobody will prompt you again. Before
you end a turn, make sure the next event you need will wake you. See
`babysit-pr`.

## Proof

Proof is evidence you observed yourself in this session: command output, a
reproduction, a screenshot. Use the most direct proof the change allows:

- Reproduce the original failure, apply the fix, then watch the same
  reproduction pass.
- Run the checks that the repo's CI runs (typecheck, lint, tests).
- Add one focused test that fails without the fix, when the behavior has none
  and the repo has a test setup.
- For UI and runtime behavior, run the app and look at the change. Green mocked
  tests do not prove that the user experience works. Use the harness's own
  browser (T3's `preview_*` tools), or Helium through computer use. Never use
  Chrome, headless Chrome, or Playwright. Attach screenshots with the
  `file-upload` skill.

Clean up only what you created, by exact path. When you cannot find a way to
prove a change, you do not have full confidence. Ask Dhruv.

## Review

Run the `sol-loop` skill on the PR, and keep watching the PR with `babysit-pr`
while it runs. `sol-loop` owns the review: the rounds, when to push, the
`Reviewed with sol-loop` line, and when a later change needs another round.
This skill counts as permission to push once Sol agrees.

While a Sol round runs, collect bot findings and CI results, but do not edit,
push, or rebase. Between rounds, fix real bot findings and CI failures along
with Sol's findings, so Sol reviews those fixes too. After the loop, keep
babysitting until the bots and checks settle on the latest commit.

A repo may have no review bots, or its bots may skip the PR (for example
"does not receive automatic reviews"). Treat those bots as absent. Sol is the
reviewer then.

## Delegating

When you hand any of this work to another agent or thread, start its brief with
"Full stop. Use the full-stop skill." word for word, then give the goal, scope,
and context. Do not restate, narrow, or extend this skill's rules in the brief.
Sol review briefs from `sol-loop` are the exception: they stay review-only and
use `sol-loop`'s own brief.

## Asking Dhruv

A question in a normal message goes unseen, and the thread looks done. To ask
Dhruv something, use the harness's question tool so the thread shows that it is
waiting: `AskUserQuestion` in Claude Code, `request_user_input_async` or
`request_user_input` in Codex. Put all the context in the question: the PR
link, what blocks you, and the options with your recommendation first. After
an async question, end your turn and wait for the reply.

Ask only when you cannot continue alone:

- You cannot prove the change.
- The ready check cannot pass, and you cannot fix that yourself.
- Sol and you still disagree on a blocker or should when the loop stops.
- The next step is outside "Authority": deleting data, touching production
  when the request is not itself production work, changing things outside the
  repo, or closing a PR.
- The goal is ambiguous in a way that changes the result.
- Another PR makes this one obsolete.

Decide everything else yourself with sensible defaults, and list those decisions
in the report.

If no question tool is available, or it refuses or errors, take the safe path:
stop with the PR open and unmerged, call `unwatch_pull_request`, and start your final
message with the question.

## Ready check and handoff

Check the live PR on GitHub, not your local state. Hand off only when all of
these are true on the latest pushed commit. If any of them fails, go back to
the steps: fix it, prove the fix, push, and review again. Do not hand off a PR
that you know still needs work from you.

- Your proof covers every change in the diff, and the description says how
  you proved it. Screenshots or recordings are attached for UI changes. The
  description matches the final diff, and the PR is ready, not a draft.
- Sol agreed on the current behavior diff (see `sol-loop`), and the
  description has the `Reviewed with sol-loop` line.
- Required checks are green. Every failure is fixed, or proven to be an
  infrastructure flake by a passing rerun.
- Review bots that actually reviewed have finished, and each finding is fixed
  or dismissed with a written reason.
- No human review still requests changes.
- The branch is up to date with the default branch, and GitHub reports it as
  mergeable.

A bot that only asks for a human review is not a blocker; note it in the
report. Auto-merge stays off, and the PR stays out of any merge queue. Call
`unwatch_pull_request`, then stop working: no new commits, no new comments, no
extra polish. Leave the PR open, ready, and unmerged. Never treat silence as
permission to merge, and never ask Dhruv to merge something that fails the
ready check.

## Report

Keep it short:

- PR link, final head, and GitHub's mergeable state.
- Proof, in a line or two.
- Sol: rounds and verdict. Bots and checks: one line each.
- Decisions made for Dhruv, as bullets, or "none".
- That you stopped watching and did not merge.
