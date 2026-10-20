---
name: npm-release
description: Set up, repair, or ship npm package releases from GitHub Actions with trusted publishing (OIDC, no npm token). Use when Dhruv asks to publish or release an npm package, cut a new version, set up or fix a release workflow, do a first npm publish, or check that a release reached npm and GitHub.
---

# npm release

Dhruv's packages release from a merge to the default branch, not from a tag
push. `package.json` holds the version. When that version is not released yet,
CI publishes it to npm with trusted publishing, then creates the `vX.Y.Z` tag
and a GitHub release from `CHANGELOG.md`. Tag, `package.json`, and npm version
always match.

## Ship a new version

1. Pick the version. See "Versioning".
2. In one PR: bump `version` in `package.json` and add a `## [X.Y.Z]` section
   to `CHANGELOG.md` with the user-facing changes. Run the repo's checks and
   `npm pack --dry-run`, and confirm the file list is what should ship.
3. Merge it. The release workflow does the rest.
4. Verify. See "Verify".

Never publish from your machine once CI publishing works, and never add an
`NPM_TOKEN`.

## Release workflow

Model new and repaired workflows on this one (from `Dhruv2mars/htmlartifact`).
Replace `<pkg>` and the check commands. Use bun for install and scripts, and
`npm publish` to publish: `bun publish` cannot do trusted publishing.

```yaml
name: Release
on:
  push:
    branches: [main]
  workflow_dispatch:
permissions:
  contents: read
concurrency:
  group: release
  cancel-in-progress: false
jobs:
  release:
    runs-on: ubuntu-latest # trusted publishing needs GitHub-hosted runners
    timeout-minutes: 20
    permissions:
      contents: write # create the tag and release
      id-token: write # npm trusted publishing
    env:
      GH_TOKEN: ${{ github.token }}
    steps:
      - uses: actions/checkout@v7
      - id: plan
        name: Decide what to release
        run: |
          version=$(node -p "require('./package.json').version")
          echo "version=$version" >> "$GITHUB_OUTPUT"
          if git ls-remote --exit-code --tags origin "refs/tags/v$version" >/dev/null; then
            echo "action=none" >> "$GITHUB_OUTPUT"
          elif npm view "<pkg>@$version" version >/dev/null 2>&1; then
            echo "action=tag" >> "$GITHUB_OUTPUT"
          elif npm view <pkg> name >/dev/null 2>&1; then
            echo "action=publish" >> "$GITHUB_OUTPUT"
          else
            echo "::notice::<pkg> is not on npm yet. The first publish is manual."
            echo "action=none" >> "$GITHUB_OUTPUT"
          fi
      - if: steps.plan.outputs.action != 'none'
        name: Extract release notes
        run: |
          version=${{ steps.plan.outputs.version }}
          awk -v v="$version" '$0 ~ "^## \\[" v "\\]" {on=1; next} on && (/^## / || /^\[[^]]*\]: /) {exit} on' CHANGELOG.md > notes.md
          test -s notes.md || { echo "::error::CHANGELOG.md has no section for $version"; exit 1; }
      - if: steps.plan.outputs.action == 'publish'
        uses: oven-sh/setup-bun@v2
      - if: steps.plan.outputs.action == 'publish'
        uses: actions/setup-node@v7
        with:
          node-version: 24
          registry-url: https://registry.npmjs.org
      - if: steps.plan.outputs.action == 'publish'
        name: Check, test and publish
        run: |
          npm install -g npm@latest # trusted publishing needs npm >= 11.5.1
          bun install --frozen-lockfile
          bun run test
          npm publish --access public
      - if: steps.plan.outputs.action != 'none'
        name: Tag and create the GitHub release
        run: |
          version=${{ steps.plan.outputs.version }}
          # Tag the commit npm published from (gitHead), else this commit.
          target=$(npm view "<pkg>@$version" gitHead 2>/dev/null || true)
          gh release create "v$version" --target "${target:-$GITHUB_SHA}" --title "v$version" --notes-file notes.md
```

Why it is shaped this way:

- The plan step makes reruns safe. A version that is already tagged does
  nothing. One that is on npm but untagged only gets its tag and release.
- It checks the changelog before publishing, and publishes before tagging,
  so a failed run leaves no orphan tag and no untagged release.
- Trusted publishing adds provenance on its own. Don't pass `--provenance`.
  It needs a public repo and package.
- If the publish fails with `ENEEDAUTH` while `registry-url` is set, add
  `unset NODE_AUTH_TOKEN` before `npm publish`.

For a CLI that ships compiled binaries, add the build to this flow. See
[binaries.md](./references/binaries.md).

## Package checks

The published `package.json` needs:

- The right `name` (scoped `@dhruv2mars/<name>` or unscoped, as the repo
  already uses).
- `repository.url` matching the GitHub repo exactly. Trusted publishing
  checks it. Add `repository.directory` when the package is not at the root.
- `files` limited to what should ship, and `bin` for a CLI.
- `publishConfig.access: public` for scoped packages.

## First publish

Trusted publishing only works for a package that already exists on npm. If
`npm view <pkg>` returns 404:

1. Make the package publishable, and merge the release workflow so it is on
   the default branch.
2. Publish once by hand from the package directory: `npm login --browser=false`,
   then open the printed URL with `open -a Helium "<url>"`. Never use another
   browser. Dhruv approves the login with 2FA, so ask him with the harness's
   question tool and wait. Then run `npm publish --access public`.
3. Add the trusted publisher (next section) right away.
4. Run the workflow manually (`gh workflow run release.yml`). It sees the
   version on npm and only creates the tag and release.

## Trusted publisher

Set it up on npmjs.com (package → Settings → Trusted publishing → GitHub
Actions), or with npm 11.15 or newer:

```bash
npm trust github <pkg> --file release.yml --repo Dhruv2mars/<repo> --allow-publish -y
npm trust list <pkg> --json
```

- Every field must match exactly, including the `.yml` in the workflow file
  name. npm does not check them when you save. A mismatch shows up at publish
  time as `ENEEDAUTH`.
- New configurations can only stage releases by default. Allow direct publish
  (`--allow-publish`, or the "Allow npm publish" box) so CI releases go out
  without a manual approval. Use staging instead only if Dhruv asks for it.
- A new configuration expires 48 hours after creation unless a publish
  succeeds through it. Create it right before the release that will use it.
- `npm trust` needs 2FA on the account, so Dhruv approves it.
- Configurations can't be edited. Delete and recreate one to change it.

## Migrating an old repo

Older repos release on a `v*` tag push, often with a `scripts/release-tag.mjs`
script and an `NPM_TOKEN` fallback. When you touch one of them:

1. Replace the workflow with the one above. Delete the tag script and any
   `NPM_TOKEN` steps. Keep a binary build if the package ships binaries.
2. Point the trusted publisher at the workflow file you kept. A renamed file
   needs a new configuration.
3. Release a new patch version through the new flow to prove it works.
4. Delete the `NPM_TOKEN` secret from the repo once that release is on npm.

## Versioning

Start new packages at `0.0.1`. Unless Dhruv asks otherwise:

- `0.0.x` for fixes, polish, small features, packaging, and release-flow
  changes.
- `0.x.0` for a clear new phase: a major feature, a broad expansion, or a
  rewrite.

Don't jump versions casually.

## Verify

After the merge:

1. `gh run watch <run-id> --exit-status` on the release run.
2. `npm view <pkg> version dist-tags.latest --json` shows the new version.
3. `gh release view vX.Y.Z --json tagName,url,assets` shows the release, with
   assets if the package ships binaries.
4. `bunx <pkg>@latest --version`, or another smoke run, works from a clean
   directory.

Report the npm version, the release link, and the smoke output.
