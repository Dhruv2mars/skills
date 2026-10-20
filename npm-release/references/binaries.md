# Shipping binaries

Some of Dhruv's CLIs ship a compiled binary (Rust, or `bun build --compile`).
The npm package stays small: a `bin` launcher plus a `postinstall` script
(`bin/install.js`) that downloads the binary for the current platform from the
GitHub release `v<version>` and checks it against a checksums file. Repos
already doing this: `mdv`, `codexchat`, `offdex`. Copy their `install.js`
rather than writing a new one.

## Order matters

`postinstall` downloads from the GitHub release, so the release and its assets
must exist before the npm version does. With binaries, the release workflow
becomes:

1. **plan**: same as the main workflow, plus a check of the release's
   assets. Run the jobs below whenever the action is `publish` or `tag`, so a
   version that reached npm without its release still gets its binaries.
2. **build**: a matrix over the targets (for example `darwin-arm64`,
   `darwin-x64`, `linux-x64`, `linux-arm64`, `win32-x64`). Each job builds and
   uploads its binary as a workflow artifact.
3. **release**: download all artifacts and write `checksums.txt` (sha256).
   If the release does not exist, `gh release create v<version> --target
   $GITHUB_SHA --notes-file notes.md` with every binary and `checksums.txt`.
   If it does, `gh release upload v<version> <files> --clobber`.
4. **publish**: only for `publish`. `npm publish --access public`, in a job
   with `id-token: write`.

Here the tag exists before npm has the version, so the plan step must not
treat "tagged" as done. Decide from npm and the release assets instead: not
on npm means `publish`; on npm with missing assets means `tag`; both present
means `none`.

## Checks

- Asset names in the workflow and in `install.js` match exactly, per platform
  and arch, including `.exe` on Windows.
- After the release: `gh release view v<version> --json assets` lists every
  target plus `checksums.txt`, and `bunx <pkg>@latest --version` works on this
  Mac from a clean directory.
- Extra artifacts that can fail on their own (an Android build, a crates.io
  publish) go behind a `workflow_dispatch` input, off the npm path.
