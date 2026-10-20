# skills

My agent skills for Claude Code and Codex.

| Skill | What it does |
| --- | --- |
| `full-send` | On "full send", the agent finishes the work, files the PR, gets it reviewed by Sol and the review bots, gets CI green, and merges it. |
| `full-stop` | Same as `full-send`, but it stops before merging so I can merge. |
| `sol-loop` | GPT-6.1 Sol reviews the change for up to 3 rounds, and the agent fixes what it finds. |
| `takeover` | Continues someone else's PR, branch, or agent thread. |
| `file-pr` | Opens a short PR. |
| `file-upload` | Adds before/after screenshots and a screen recording to a PR with `gh --attach`. |
| `babysit-pr` | Watches a PR through CI and review until it can merge. |
| `leaving-pr-comments` | Formats the PR comments an agent posts for me. |
| `thermo-nuclear-review` | Sol's checklist for bugs, breaking changes, and security issues during `sol-loop`. |
| `thermo-nuclear-code-quality-review` | Sol's checklist for maintainability during `sol-loop`. |
| `postplan` | Publishes an HTML page to Postplan and returns the link. |
| `npm-release` | Releases an npm package that ships binaries through GitHub Releases. |

## Install

```sh
git clone https://github.com/Dhruv2mars/skills ~/dev/github/skills
for s in ~/dev/github/skills/*/; do ln -sfn "$s" ~/.agents/skills/; done   # Codex
```

Codex gets every skill. Claude Code gets all of them except `npm-release` and
the thermo pair, which only Codex uses. Link them through `~/.agents/skills`,
into every Claude config dir you run (`~/.claude`, and any `CLAUDE_CONFIG_DIR`
profile such as `~/.claude-work`):

```sh
for s in full-send full-stop sol-loop takeover file-pr file-upload babysit-pr leaving-pr-comments postplan; do
  ln -sfn ~/.agents/skills/$s ~/.claude/skills/$s
done
```

Another macOS user on the same machine can link straight to this checkout
instead of cloning it, so it never goes stale.

Run `git pull` to update every linked skill.

## Credit

- `full-send`, `full-stop`, `sol-loop`, `takeover`, `file-pr`, `babysit-pr`, and `leaving-pr-comments` are rebuilt from skills Theo Browne ([@t3dotgg](https://github.com/t3dotgg)) showed on stream. `file-upload` started from his idea and was redesigned.
- The thermo-nuclear pair comes from Cursor's [cursor/plugins](https://github.com/cursor/plugins/tree/main/thermos/skills).
