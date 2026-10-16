# skills

My agent skills for Claude Code and Codex.

| Skill | What it does |
| --- | --- |
| `full-send` | On "full send", the agent finishes the work, files the PR, gets it through review and CI, and merges it. |
| `full-stop` | Same as `full-send`, plus a Sol review, but it stops before merging. |
| `sol-loop` | GPT-6.1 Sol reviews the change for up to 3 rounds, and the agent fixes what it finds. |
| `takeover` | Continues someone else's PR, branch, or agent thread. |
| `file-pr` | Opens a short PR. |
| `file-upload` | Uploads screenshots and videos to GitHub and returns a URL to embed. Works in repos you cannot write to. |
| `babysit-pr` | Watches a PR through CI and review until it can merge. |
| `leaving-pr-comments` | Formats the PR comments an agent posts for me. |
| `thermo-nuclear-review` | Audits a branch for bugs, breaking changes, and security issues. |
| `thermo-nuclear-code-quality-review` | Reviews a branch for maintainability. |
| `postplan` | Publishes an HTML page to Postplan and returns the link. |
| `npm-release` | Releases an npm package that ships binaries through GitHub Releases. |

## Install

```sh
git clone https://github.com/Dhruv2mars/skills ~/dev/github/skills
ln -s ~/dev/github/skills/<skill> ~/.claude/skills/   # Claude Code
ln -s ~/dev/github/skills/<skill> ~/.agents/skills/   # Codex
```

Run `git pull` to update every linked skill.

## Credit

- The first eight skills are rebuilt from ones Theo Browne ([@t3dotgg](https://github.com/t3dotgg)) showed on stream.
- The thermo-nuclear pair comes from Cursor's [cursor/plugins](https://github.com/cursor/plugins/tree/main/thermos/skills).
