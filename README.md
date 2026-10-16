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

Each skill is a folder with a `SKILL.md`. Copy or symlink the folders into `~/.agents/skills/` for Codex and other agents, or into `~/.claude/skills/` for Claude Code.

```sh
git clone https://github.com/dhruv2mars/skills ~/dev/github/skills
mkdir -p ~/.agents/skills ~/.claude/skills
for d in ~/dev/github/skills/*/; do
  ln -s "${d%/}" ~/.agents/skills/
  ln -s "${d%/}" ~/.claude/skills/
done
```

To install one skill, link only its folder, for example `ln -s ~/dev/github/skills/file-pr ~/.claude/skills/`.

## T3 Code tools

Some skills call T3 Code tools when they are available. `babysit-pr`, `full-send`, and `full-stop` use `watch_pull_request` to wait for PR changes, and `sol-loop` uses `delegate_task` to start the reviewer. Outside T3 Code they fall back to polling the PR or to a native subagent.

## Credit

`full-send`, `full-stop`, `sol-loop`, `takeover`, `babysit-pr`, `file-pr`, and `leaving-pr-comments` are adapted from skills Theo Browne ([@t3dotgg](https://github.com/t3dotgg)) showed on stream.

- `full-stop` and `leaving-pr-comments` were only partly visible on stream, so parts of them are my reconstruction.
- `babysit-pr` and `file-pr` were rebuilt from an older version he showed, then updated to match his current workflow.
