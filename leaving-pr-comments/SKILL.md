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
for example "Claude Opus 5.5" or "GPT-6.2 Sol". Never use a model ID or slug
such as `claude-opus-5-5` or `gpt-6.2-sol`.

Keep the attribution inside the note and the reply outside it. Add no
horizontal rule, heading, signature, or second attribution. Use this format
for top-level comments, inline review comments, replies to bots, and the
reasons you write before resolving or dismissing feedback. Leave it off PR
descriptions, commit messages, and text Dhruv asked to post verbatim.

Write the comment itself directly: lead with the conclusion, cite the code,
check, or reproduction, keep it short with no canned thanks or status
narration, and separate verified facts from judgment.

Before posting, check the whole comment, including quotes and attachments,
for secrets and private details. After posting, confirm GitHub returned the
comment or review URL. Resolve a review thread only after its reply posted.
