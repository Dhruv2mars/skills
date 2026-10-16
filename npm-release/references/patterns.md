# Release Patterns

## Best Pattern

Prefer a release flow with these properties:

- Tag-driven release on `v*`
- Optional `resolve_tag` support for manual reruns
- Strict version validation before release
- Idempotent GitHub release creation
- Binary build matrix with checksum uploads when binaries are shipped
- npm trusted publishing through GitHub Actions OIDC
- Optional non-npm artifacts gated off the default npm-critical path

This keeps the normal npm release path fast and robust while still allowing more complex artifacts to ship separately.

## First Publish Rule

If the package does not exist on npm, do a manual publish first. Then add trusted publisher. Then ship the next version through GitHub Actions to verify the final path.

That is usually the shortest path to a stable trusted-publisher setup.

## Migration Guidance

When upgrading an older repo:

- Keep the current release workflow working first
- Publish manually once if the package does not exist yet
- Add trusted publisher for `release.yml`
- Verify a real new version publishes through GitHub Actions without token auth
- Remove `NPM_TOKEN` dependence after the trusted path is proven

## Versioning Policy

- Start at `v0.0.1`
- Use `v0.0.x` for fixes and incremental shipping
- Use `v0.x.0` only for genuinely larger additions or a substantial revamp
