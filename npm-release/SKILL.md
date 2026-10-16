---
name: npm-release
description: Release npm packages that also ship binaries through GitHub Releases. Use when Codex needs to set up or repair `.github/workflows/release.yml`, configure npm trusted publishing for GitHub Actions, do a first manual npm publish, tag and ship a new version, or verify that npm and GitHub release distribution both work end to end.
---

# Npm Release

## Preferred Pattern

Prefer this order:

1. Make the package publishable locally.
2. Do the first npm publish manually if the package does not exist yet.
3. Configure npm trusted publishing for `release.yml`.
4. Verify a real tagged release publishes to npm without `NPM_TOKEN`.

Treat long-lived npm tokens as fallback or migration-only. The preferred steady state is GitHub Actions OIDC trusted publishing.

## Repo Audit

Start by locating:

- Root `package.json`
- Published package `package.json`
- `.github/workflows/release.yml`
- Any release tag script such as `scripts/release-tag.mjs`

Confirm the published package has:

- Correct scoped `name`
- `publishConfig.access` set to `public`
- `repository.url` matching the exact GitHub repo
- `repository.directory` pointing at the published package folder
- `files` limited to what should ship
- `bin` entry present if this is a CLI

Load [patterns.md](./references/patterns.md) for the generic release pattern and migration notes.

## Release Workflow Rules

The release workflow should usually have these jobs:

1. `validate`
2. `create_release`
3. `build_upload`
4. `publish_npm`

For more complex repos, add `resolve_tag` first so manual reruns can republish an existing tag.

Keep these rules:

- Trigger on `push.tags: v*`
- Validate the tag matches the package version
- Create the GitHub release idempotently
- Build binaries in a matrix and upload checksums
- Publish npm only after build upload succeeds
- Give `publish_npm` `id-token: write`
- Use `npm publish --provenance --access public` for trusted publishing

If the repo has extra release artifacts that can fail independently, such as signed Android builds, gate them behind `workflow_dispatch` input instead of blocking the default npm path.

## First Publish

If `npm view <package>` returns 404, the package does not exist yet. Trusted publishing alone is not enough. Do this first:

1. Log in with `npm login`.
2. If npm prints a browser URL, open it in Brave:
   `open -a "Brave Browser" "<url>"`
3. Wait for browser approval to complete.
4. Publish from the package directory:
   `npm publish --access public`

If npm asks for browser approval again during publish, open that URL in Brave and wait for the terminal to finish.

This is the fastest first-publish path when the user already owns the npm scope.

## Trusted Publisher Setup

After the package exists, configure trust for GitHub Actions.

Use npm 11.10 or newer. If the local npm does not support `npm trust`, use:

```bash
npx npm@11.11.1 trust github <package-name> --file release.yml --repo <owner/repo> -y
```

Verify with:

```bash
npx npm@11.11.1 trust list <package-name> --json
```

The trusted publisher must match exactly:

- GitHub owner or org
- Repository name
- Workflow filename only, for example `release.yml`

Do not assume npm trust is configured just because the workflow has `id-token: write`. Verify it explicitly.

## Publish Job Template

Use this shape in `publish_npm`:

```yaml
permissions:
  contents: read
  id-token: write
```

Then:

```bash
set -euo pipefail
local_v="$(node -p "require('./packages/npm/package.json').version")"
remote_v="$(npm view @scope/pkg version 2>/dev/null || true)"
if [ -n "${remote_v:-}" ] && [ "${remote_v}" = "${local_v}" ]; then
  echo "skip: already on npm (${remote_v})"
  exit 0
fi
rc="${RUNNER_TEMP:-/tmp}/npmrc"
echo "registry=https://registry.npmjs.org/" > "$rc"
export NPM_CONFIG_USERCONFIG="$rc"
unset NODE_AUTH_TOKEN || true
cd packages/npm && npm publish --provenance --access public
```

If the repo still needs a temporary token fallback, keep it explicit and prefer the trusted-publisher branch first.

## Tagging

Prefer a repo script like `scripts/release-tag.mjs` over ad hoc shell when multiple files must agree on version.

At minimum, the tag step should protect against version drift:

- Single-package repos: package version must match the tag
- Mixed app + npm repos: app version, package version, and npm package version must all match

Use a `--print` mode on the tag script when possible so you can verify the expected tag before pushing.

## Versioning Rule

Start new packages at `v0.0.1`.

Use this rule unless the user explicitly asks for a different release policy:

- Bump `v0.0.x` for fixes, polish, small follow-up features, release-flow repairs, packaging changes, and other incremental work.
- Bump `v0.x.0` for a clear new phase: major feature addition, broad product expansion, or substantial rewrite/revamp.

Do not jump versions casually. Keep early package history dense and predictable.

## Verification

Verify locally before tagging:

- Package tests for the published package
- `npm pack --dry-run` on the published package directory
- Tag script `--print` output if available

Verify live after tagging:

1. Watch the release run:
   `gh run watch <run-id> --exit-status`
2. Confirm the npm job succeeded without token auth errors.
3. Confirm the package version on npm:
   `npm view <package-name> version dist-tags.latest --json`
4. Confirm the GitHub release has the expected assets:
   `gh release view <tag> --json tagName,publishedAt,assets,url`

If the version is already on npm, bump the version before trying to prove trusted publishing. Otherwise the job will skip and you will learn nothing.

## Migration Guidance

When upgrading an older repo:

1. Keep the existing release workflow working.
2. Publish the package manually once if needed.
3. Add npm trusted publisher.
4. Rerun or retag with a new version to prove OIDC publish works.
5. Remove `NPM_TOKEN` dependence once verification succeeds.

Prefer the trusted-publisher-only end state once it is proven.
