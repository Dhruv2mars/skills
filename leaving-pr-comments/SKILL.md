---
name: leaving-pr-comments
description: Format and post agent-authored GitHub pull request
  comments on Dhruv's behalf with the preferred compact attribution
  callout. Use whenever an agent drafts, posts, replies to, or
  resolves a PR or review comment for Dhruv, including comments
  made by other PR skills.
---

# Leaving PR Comments

> On a repo whose `origin` is `entire://...` there is no GitHub: a PR is an Entire Trail. Use the Trail mapping in the global "Entire" instructions in place of every `gh` and PR step below.

Prefix every agent-authored comment left on Dhruv's behalf with this GitHub note
callout:

```md
> [!NOTE]
> 🤖 **<model> responding on behalf of Dhruv**

Actual comment starts here.
```

Replace `<model>` with the public name of the model that wrote the comment,
for example "Claude Opus 5.5" or "GPT-6.1 Sol". Never use a model ID or slug
such as `claude-opus-5-5` or `gpt-6.1-sol`.
