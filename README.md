# skills

Agent skills I use with Claude Code and Codex, mostly inside T3 Code.

## Skills

| Skill | What it does |
| --- | --- |
| `babysit-pr` | Monitors a pull request through review and CI. Use when asked to monitor, watch, or babysit a PR. |
| `file-pr` | Files a concise pull request. Use when asked to file, open, or create a PR. |
| `full-send` | Triggered by "full send". The agent finishes the work, files the PR, babysits it, and merges it once the merge gate passes. |
| `full-stop` | Triggered by "full stop". Same as `full-send`, plus a `sol-loop` review, but it stops at a PR ready to merge and never merges. |
| `leaving-pr-comments` | Formats and posts agent-written PR and review comments on my behalf with a short attribution callout. Other PR skills use it too. |
| `sol-loop` | Triggered by "sol loop". Has GPT-6.1 Sol review the change in a loop, 3 rounds by default, and applies the smallest fixes. |
| `takeover` | Takes over existing work: a PR, a branch, or an agent thread. |
| `postplan` | Publishes a self-contained HTML page to Postplan and returns a public link. Also updates, versions, and lists published drafts. |
| `thermo-nuclear-review` | Runs a strict security and correctness audit of a branch's changes: bugs, breaking changes, security issues, devex regressions, and feature-gate leaks. |
| `thermo-nuclear-code-quality-review` | Runs a strict maintainability review covering abstraction quality, giant files, and growing piles of conditionals. |
| `npm-release` | Releases npm packages that also ship binaries through GitHub Releases. Covers the release workflow, npm trusted publishing, the first manual publish, tagging, and end-to-end checks. |

## Install

```sh
git clone https://github.com/Dhruv2mars/skills ~/dev/github/skills
ln -s ~/dev/github/skills/file-pr ~/.claude/skills/   # Claude Code
ln -s ~/dev/github/skills/file-pr ~/.agents/skills/   # Codex
```

Repeat the `ln -s` lines for each skill you want. A `git pull` updates every linked skill.

## T3 Code tools

`babysit-pr`, `full-send`, and `full-stop` use T3 Code's `watch_pull_request` to wait for PR changes. Without T3 Code they poll the PR. `sol-loop` starts the reviewer with T3 Code's `delegate_task`, and uses the Codex CLI when T3 Code is not available.

## Credit

`full-send`, `full-stop`, `sol-loop`, `takeover`, `babysit-pr`, `file-pr`, and `leaving-pr-comments` are adapted from skills Theo Browne ([@t3dotgg](https://github.com/t3dotgg)) showed on stream.

- `full-stop` and `leaving-pr-comments` were only partly visible on stream, so parts of them are my reconstruction.
- `babysit-pr` and `file-pr` were rebuilt from an older version he showed, then updated to match his current workflow.

`thermo-nuclear-review` and `thermo-nuclear-code-quality-review` come from Cursor's [cursor/plugins](https://github.com/cursor/plugins/tree/main/thermos/skills). The only change is `disable-model-invocation: false`, so agents can start them without being asked. To pull Cursor's latest version:

```sh
for s in thermo-nuclear-review thermo-nuclear-code-quality-review; do
  gh api repos/cursor/plugins/contents/thermos/skills/$s/SKILL.md -q .content | base64 -d |
    sed 's/^disable-model-invocation: true/disable-model-invocation: false/' > $s/SKILL.md
done
```
