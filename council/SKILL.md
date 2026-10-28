---
name: council
description: Get review or feedback from a council of three models (Fable 5.1, GPT-6.1 Sol, Opus 5.5) and loop until they agree. Use when the user says "council".
---

# Council

> On a repo whose `origin` is `entire://...` there is no GitHub: a PR is an Entire Trail. Use the Trail mapping in the global "Entire" instructions in place of every `gh` and PR step below.

Before an audit, address outstanding PR comments, fix known issues, and run
relevant checks. Give council the updated implementation; do not defer known
fixes until reviews return. If the user wants to discard the implementation
and explore new ideas, skip fixes to code being replaced.

## Members

Three delegates, each at high effort:

- Claude Fable 5.1
- GPT-6.1 Sol
- Claude Opus 5.5

If Dhruv names other members for this request, use those. If a member is
unavailable, report it instead of substituting.

## Start them

In T3, call `orchestrator_capabilities` and find each model. A model may be
offered by only one provider instance (Fable can sit on a second Claude
profile); use the instance that lists it. Start all three in parallel with
`delegate_task` (`role: "review"`, `mode: "async"`), a new `clientRequestId`
each round, and keep every `taskId`. In Claude Code, T3 tools are deferred:
load them with ToolSearch first.

Without T3, use native subagents for the models your harness runs, and the
Codex CLI for Sol (`codex exec -m gpt-6.1-sol -s read-only -C <repo> --json "<brief>"`).

Give each delegate the request and relevant context; children get no history.
For review or feedback, keep them read-only: no edits, commits, pushes, PR
comments, or subagents. For a code review, send `sol-loop`'s round 1 brief
and add a line asking for `SCORE: <n>/10`. Wait for the notices; do not poll.
A timeout, error, or no reply is not approval.

Collect their responses and summarize the useful findings, disagreements, and
recommended next steps.

## Loop

Count each full review pass as one round. A fresh review after fixes starts a
new round. Check each finding yourself and answer it like `sol-loop` step 3:
smallest fix, or disagree with evidence, or decline as a nit. Send each
delegate the ledger and the change since its last round.

If you agree with their recommendations, make the changes and request a fresh
review after. Continue until all three are satisfied. Use `sol-loop`'s budget
and stuck rules. When `full-send` or `full-stop` is driving, ask Dhruv with
that skill's "Asking Dhruv" rules.

Do not let repeated reviews result in scope creep. It is your job to fight to
keep scope limited.

## Results

If the work ends in a pull request, put this section in the description, above
the closing model line:

```markdown
## Council review

Rounds: 2

| Delegate | Round 1 | Round 2 |
| --- | --- | --- |
| Claude Fable 5.1 | 7/10 | 9/10 |
| GPT-6.1 Sol | 8/10 | 10/10 |
| Claude Opus 5.5 | 7/10 | 9/10 |
```

If a delegate gives no score, write `no score`. Do not invent one. If the PR is
open, edit the description; do not post a comment for this. If there is no PR,
put the same results in the final reply only.
