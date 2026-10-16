---
name: postplan
description: Publish a self-contained HTML page to Postplan and return its public shareable URL. Use when the user says postplan, or asks to publish, share, or get a link for a plan, report, doc, or artifact; to update or version an already-published draft; to list published drafts; or when a postplan upload is rejected or auth fails.
---

# postplan

Publish a plan, report, or artifact as a public HTML page at `https://<draft-id>.postplan.dev`.

## Steps

1. **Write one self-contained `.html` file** — Postplan takes HTML only, so convert Markdown source first. Inline `<style>` and inline classic `<script>` only; system font stacks; images from `https:` or `data:` URIs. External script URLs, external font CDNs, `<form>`, `<iframe>`, and meta-refresh are rejected by the uploader.
2. **Scrub it.** Uploads are public and unlisted-by-URL only — no API keys, tokens, internal hostnames, or private data in the markup.
3. **Upload.**
   ```bash
   npx postplan@latest upload ./plan.html --description "Short title"
   ```
   Re-running on the **same file path** publishes a new version of the same draft — `~/.postplan/drafts.json` holds the path→draft mapping that makes that automatic. `--new` forces a fresh draft; `--draft <id>` targets a specific one.
4. **Report the URL**, adding `https://postplan.dev/d/<draft-id>/raw` when the user wants the source HTML.

Done when the CLI prints a URL and it loads.

## Living pages

A draft's URL never changes as versions accumulate, so a draft is the right shape for a progress tracker, status page, or running log — share the link once, then keep re-uploading. To keep one:

- **Keep the source file at a durable path** — `~/postplan-drafts/<name>.html`, or inside the repo the work lives in. A scratch or temp path loses the file, and a lost file means a new draft and a dead link.
- **Update with a bare re-upload:** `npx postplan@latest upload <same-path>`, alone. Every flag that mints a fresh draft orphans the URL people are already holding.
- **Rebind after a move or rename** with `--draft <draft-id>` once. That rewrites the mapping permanently; later bare uploads from the new path reach the same draft.
- **Regenerate the whole page each update.** A version is a full snapshot, not a patch, so every upload carries the complete current state.

## Auth

Credentials live in `~/.postplan/credentials.json`. `npx postplan@latest whoami` confirms them. If unauthenticated, ask the user to run one of these themselves — both need a browser or a key you should not see:

```bash
npx postplan@latest auth login          # browser flow, works over SSH
npx postplan@latest auth set <api-key>  # key from https://postplan.dev/cli/auth
```

## Elsewhere

- `npx postplan@latest list` — published drafts.
- Dashboard `https://postplan.dev/dashboard/` — versions, descriptions, detected git repo links.
