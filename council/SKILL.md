---
name: council
description: Get review or feedback from a council of two models (GPT-6.2 Sol, Fable 5.2) and loop until they agree. Use when the user says "council".
---

# Council

> On a repo whose `origin` is `entire://...` there is no GitHub: a PR is an Entire Trail. Use the Trail mapping in the global "Entire" instructions in place of every `gh` and PR step below.

Before an audit, address outstanding PR comments, fix known issues, and run
relevant checks. Give council the updated implementation; do not defer known
fixes until reviews return. If the user wants to discard the implementation
and explore new ideas, skip fixes to code being replaced.

## Members

Two delegates:

- GPT-6.2 Sol at high effort
- Claude Fable 5.2 at medium effort

If Dhruv names other members for this request, use those. If a member is
unavailable, report it instead of substituting.

## Start them

In T3, call `orchestrator_capabilities` and find each model. A model may be
offered by only one provider instance (Fable can sit on a second Claude
profile); use the instance that lists it. Start both in parallel with
`delegate_task` (`role: "review"`, `mode: "async"`), each member's effort in
`target.options`, a new `clientRequestId` each round, and keep every `taskId`.
In Claude Code, T3 tools are deferred: load them with ToolSearch first.

Without T3, use native subagents for the models your harness runs (keep each
subagent's ID), and `sol-loop`'s Codex CLI fallback for Sol, with
`-c model_reasoning_effort=high`. Give each member the effort listed above.

Give each delegate the request and relevant context; children get no history.
For review or feedback, keep them read-only: no edits, commits, pushes, PR
comments, or subagents. For a code review, scope the change with `sol-loop`
step 1, then send its round 1 brief and add a line asking for
`SCORE: <n>/10`. Wait for the notices; do not poll. A timeout, error, or no
reply is not approval.

Do not wait idle. When a result arrives, check its findings against the code
at once and decide what to fix while the other delegate runs. Do not edit
files while a delegate still reviews the same checkout. If the user marks a
delegate as non-blocking, do not wait for it; treat a late result as feedback
and do not record its score.

Collect their responses and summarize the useful findings, disagreements, and
recommended next steps.

## Loop

Count each full review pass as one round. A fresh review after fixes starts a
new round. Check each finding yourself and answer it like `sol-loop` step 3:
smallest fix, or disagree with evidence, or decline as a nit. For later
rounds, follow `sol-loop` step 4 for each delegate, keeping the SCORE line.

If you agree with their recommendations, make the changes and request a fresh
review after. Continue until both are satisfied. Use `sol-loop`'s round
budget and stuck rules; stop early when every delegate returns only nits. Its
one-reviewer rule does not apply. When `full-send` or `full-stop` is driving,
ask Dhruv with that skill's "Asking Dhruv" rules.

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
| GPT-6.2 Sol | 8/10 | 10/10 |
| Claude Fable 5.2 | 7/10 | 9/10 |
```

If a delegate gives no score, write `no score`. Do not invent one. If the PR is
open, edit the description; do not post a comment for this. If there is no PR,
put the same results in the final reply only.
