---
name: github-mirror
description: Put an Entire repo on its public GitHub mirror with free GitHub Actions CI reported back to Entire trails, or check that a mirrored repo is healthy. Use when asked to mirror a repo to GitHub, set up GitHub CI for an Entire repo, onboard a repo to the mirror, create a new repo that should also be on GitHub, or check a mirror.
---

# GitHub mirror

Entire is the only place a repo lives. GitHub (`Dhruv2mars/<name>`, public) is a one-way mirror that exists for free
Actions CI and as a public showcase. Nothing is made on GitHub: no commits, merges, PRs, issues or releases by hand.

- `git ship` = `git push` to Entire, then `git mirror`.
- `git mirror` fetches Entire's branches and tags into `refs/mirror/*`, then makes GitHub's branches and tags equal
  them in one atomic, pruning push, without `entire/*` and without running hooks. It refuses to run in a clone that
  isn't enrolled, waits for another mirror in the same clone, and stops if Entire lists no branches.
- A clone is **enrolled** when its `github` remote's push URL is exactly `DISABLED-use-git-ship-or-git-mirror`, so
  `git push github` fails instead of running Entire's pre-push hook, which would push checkpoints. Old `github`
  remotes that aren't enrolled yet have the push URL `DISABLED-not-enrolled-see-github-mirror-skill`.
- Every mirrored push runs the repo's `CI` workflow. `report.yml` posts each run attempt to the Entire commit as the
  `github-actions` check of the plugin `dhruv2mars-github-actions`, and the trail gate of the same name requires it.

Check that the global aliases exist (`~/.gitconfig`) before starting: `git config --global --get alias.ship`
(`!f() { git push "$@" && git mirror; }; f`) and `git config --global --get alias.mirror`.

## Constants

| What | Value |
| --- | --- |
| Entire project | `dhruv2mars`, id `01M5XWZDG2M87HXHW8GZPM5WEY` |
| Plugin / installation | `dhruv2mars-github-actions` / `ins_01M6PFX3GKSC1ZHBKV60ECZF76` (one per project, `selected` repos) |
| Plugin key | `~/.entire-ci/entire-plugin-key.pem` (Ed25519; GitHub secret `ENTIRE_PLUGIN_KEY`) |
| Repo ids | `entire api /api/v1/repos`: `.id` is the internal id, `"repo_" + .repoGroupId` the public id (plugin, checks) |
| Check-runs cell | `https://aws-ap-south-1.api.entire.io` today; `report.yml` uses the variable `ENTIRE_API_URL` if set |

## Pace (GitHub suspended this account once, after a scripted burst)

No GitHub limit is published as safe, so keep the pace human:

- One repo per session, at most a few a day. Never loop over repos with write actions.
- Create GitHub repos one at a time with `gh repo create`, never from a script or an Action.
- One `git mirror` per real change. No scheduled or polling mirrors, no Actions that push.
- Only each repo's own CI runs on GitHub. No `pull_request_target`, no self-hosted runners on public repos.
- Use the existing `gh` login; never mint PATs for this.
- If GitHub rejects a push (push protection, a ruleset), fix the cause first. Don't retry in a loop, and don't turn
  protection off. A rejected mirror after a successful Entire push is a partial success: Entire is fine, so fix the
  cause and run `git mirror` again.

## Onboard an existing repo (already on Entire and GitHub)

Keep a TASKS.md checklist in the repo while doing this. Work in a fresh clone if another session holds the checkout.

1. **Preflight (read only).** Record everything, and stop for Dhruv on anything surprising.
   - Run `gitleaks git` on the Entire clone (full history): GitHub push protection rejects pushes that contain
     secrets. Also look for blobs over 100 MiB and `.gitattributes` LFS entries (LFS objects are not mirrored).
   - Run `git ls-remote` on both sides and list:
     - GitHub-only branches and tags.
     - Branches where GitHub has commits that Entire lacks (`git fetch --no-tags <gh-url> <b>:refs/tmp/<b>`, then
       `git rev-list --count origin/<b>..refs/tmp/<b>`).
     - Every GitHub ref outside `refs/heads`, `refs/tags` and `refs/pull`, such as leaked `refs/entire/checkpoints/*`.
   - Note open PRs and issues, Releases, `.github/dependabot.yml`, and each workflow and its triggers: deploys,
     releases on tags, crons, `pull_request_target`, self-hosted runners. Note repo secrets, variables, environments,
     branch protection and rulesets (`gh api repos/$R/rulesets`), which can reject the mirror's force pushes and
     deletes.
   - `gh auth status` must list the `workflow` scope, or pushes that touch `.github/workflows` fail
     (`gh auth refresh -h github.com -s workflow`).
   - Choose the **reporting branch**: the branch trails target. It becomes GitHub's default and must carry
     `report.yml`, because `workflow_run` only reads the default branch. It need not be Entire's HEAD (superchant
     reports from `dev`).
2. **Save GitHub-only work into Entire.**
   - Branches and commits: `git push origin <sha>:refs/heads/archive/<name>`.
   - Tags: `git fetch --no-tags <gh-url> refs/tags/<t>:refs/tmp/gh-tags/<t>`, then
     `git push origin refs/tmp/gh-tags/<t>:refs/tags/archive/<t>`. This keeps annotated tag objects.
   - Close open PRs and issues with one comment that points to the Entire repo.
3. **Make CI mirror-ready, as a trail on Entire.**
   - The workflow that `report.yml` watches is named exactly `CI` and runs on `push` to every branch, with no
     `branches` or `paths` filters. A trail branch with no `CI` run never gets its check, and its trail can never
     merge. Ignore only branches that never become trails (`branches-ignore: ['archive/**']`).
   - Keep `workflow_dispatch`, drop `pull_request` (the mirror has no PRs), set `permissions: contents: read`, and
     cancel superseded runs except on the reporting branch.
   - Add `.github/workflows/report.yml`, copied byte for byte from this skill's `report.yml`.
   - Decide with Dhruv about each other workflow. Tag releases may stay (GitHub Releases are fine as showcase output).
     Deploys keep working but now run only after `git mirror`. Delete benches and crons nobody needs.
   - Delete `.github/dependabot.yml`: the next mirror prunes branches that Dependabot makes on GitHub.
   - Merge the trail. The plugin gate isn't on yet, so the merge needs no check.
   - Open trail branches made before this still carry the old workflows. Rebase them onto the merged base before
     relying on their checks.
4. **GitHub settings** (one call each, `R=Dhruv2mars/<name>`):
   ```sh
   gh repo edit $R --enable-issues=false --enable-projects=false --enable-wiki=false --enable-discussions=false \
     --homepage https://entire.com/et/dhruv2mars/<name> --description "<one line>. Mirror of Entire (entire.com/et/dhruv2mars/<name>); develop there."
   gh api -X PATCH repos/$R -F has_pull_requests=false
   gh api -X PATCH repos/$R --input - <<<'{"security_and_analysis":{"secret_scanning":{"status":"enabled"},"secret_scanning_push_protection":{"status":"enabled"}}}'
   gh api -X DELETE repos/$R/automated-security-fixes      # Dependabot security PRs off
   gh api -X PUT repos/$R/actions/permissions/fork-pr-contributor-approval -f approval_policy=all_external_contributors
   gh api -X PUT repos/$R/actions/permissions/workflow -f default_workflow_permissions=read -F can_approve_pull_request_reviews=false
   gh secret set ENTIRE_PLUGIN_KEY -R $R < ~/.entire-ci/entire-plugin-key.pem
   gh variable set ENTIRE_PLUGIN_INSTALLATION -R $R -b ins_01M6PFX3GKSC1ZHBKV60ECZF76
   gh variable set ENTIRE_REPO_ID -R $R -b repo_<repoGroupId>
   ```
   Read each setting back with GET. Remove secrets, variables and environments that only deleted workflows used, but
   first check that Dhruv still has those keys somewhere else.
5. **Enroll the clone and run the first mirror.**
   - If `github` exists, check that its fetch URL is `https://github.com/Dhruv2mars/<name>.git`; otherwise add it
     with `git remote add github https://github.com/Dhruv2mars/<name>.git`.
   - Set the push URL with `git config remote.github.pushurl DISABLED-use-git-ship-or-git-mirror`.
   - Delete GitHub refs that the mirror never touches but that must not be there, such as leaked `refs/entire/*`, in
     one push: `git push --no-verify "$(git remote get-url github)" --delete <ref>...`. The mirror prunes branches
     under `entire/` by itself.
   - If GitHub's default branch differs from the reporting branch, publish first, then switch the default, then
     mirror. GitHub refuses to delete its default branch, and the atomic mirror then fails as a whole.
   - Run `git mirror`.
   - Check that the heads and tags from `git ls-remote` match on both sides (minus `entire/*`), that GitHub has no
     `entire/` ref anywhere, and that `git push github` fails.
6. **Turn on the gate.**
   1. Confirm that `CI` passed on the reporting branch. `Report to Entire` fails with a 404 until the repo is in the
      installation, which is expected.
   2. Add the repo to the installation. `repository_ids` replaces the whole list and the list is paginated (30 a
      page by default), so read every page, PATCH the union, and compare the full result. In bash:
      ```sh
      I=/api/v1/plugins/dhruv2mars-github-actions/installations/ins_01M6PFX3GKSC1ZHBKV60ECZF76
      ids() { local c= p out=; while :; do p=$(entire api "$I?per_page=100${c:+&cursor=$c}") || return 1; out+=$(jq -er '.repositories[].id' <<<"$p")$'\n' || return 1; c=$(jq -r '.next_cursor // empty | @uri' <<<"$p"); [ -n "$c" ] || break; done; printf '%s' "$out" | sort -u | grep .; }
      before=$(ids) && want=$(printf '%s\nrepo_<new>\n' "$before" | sort -u) &&
        jq -Rcn '{repository_ids: [inputs | select(length > 0)]}' <<<"$want" | entire api -X PATCH "$I" --input - >/dev/null &&
        [ "$(ids)" = "$want" ] && echo "installation covers exactly:" $want
      ```
      Stop if `before` is empty (the read failed; superchant is always in it) or the final check doesn't print. Don't
      run this from two sessions at once.
   3. Rerun the last `CI` run (`gh run rerun <id> -R $R`). Confirm that `Report to Entire` passes and the commit's
      check is green on Entire (`entire api --to cell '/api/v1/repos/{repo_id}/commits/<sha>/checks'` from the checkout
      lists `github-actions` as `completed`/`success`).
   4. Read the gates with `entire api --to cell '/api/v1/repos/{repo_id}/trails/gates'` from the checkout. Entire
      creates the `dhruv2mars-github-actions` plugin gate by itself; superchant's has `createdBy: null`. If no gate
      appears after the check exists, stop and tell Dhruv rather than guessing the create body.
   5. Set the gate's checks, then confirm that `gatesEnabled`, `enabled` and `blocking` are all true:
      ```sh
      entire api --to cell -X PATCH '/api/v1/repos/{repo_id}/trails/gates/<gate id>' --input - <<<'{"config":{"version":1,"required_checks":["github-actions"]}}'
      ```
7. **Prove that the gate blocks, then add the README note.**
   - Open a throwaway trail whose CI fails. Confirm that the gate blocks it, then close it.
   - Open a trail that adds this under the README's title or tagline:
     `<sub>Developed on <a href="https://entire.com/et/dhruv2mars/<name>">Entire</a>. The GitHub copy is a read-only mirror for CI; open issues and changes on Entire.</sub>`
   - Confirm that its check goes from running to passed, merge it, and run `git mirror`.

The repo is done when all of these hold:
- Refs match on both sides, with no `entire/` ref on GitHub.
- `CI` and `Report to Entire` are green on the reporting branch.
- A failing trail was blocked and a passing one merged through the gate.
- The settings above are in place.
- `git push github` fails in the enrolled clone.

## New repo

Create it on Entire first and work there. When it should go public:
1. Run step 1's secret and size scans.
2. Create the GitHub repo with `gh repo create Dhruv2mars/<name> --public --disable-wiki --disable-issues`.
3. Do steps 3 to 7. Step 2 has nothing to do.
4. After the first `git mirror`, run `gh repo edit $R --default-branch <reporting branch>`.

## Every other clone

Enrollment is per clone; worktrees share it. Enroll any new clone or machine that will push, using step 5's remote
and push-URL lines. A clone that isn't enrolled still pushes to Entire. GitHub catches up at the next `git mirror`
from any enrolled clone, because a mirror copies the whole state, not one push. The same holds for a trail merged on
entire.com: it reaches GitHub at the next `git mirror`.

## When a check never arrives

A missing check leaves the trail blocked. Usual causes:
- No `git mirror` ran after the push.
- The commit message has `[skip ci]` or `skip-checks: true`.
- The branch predates the mirror-ready `CI`.

Rebase onto the base if the branch is old. Otherwise mirror, or start CI by hand on the branch:
`gh workflow run CI -R $R --ref <branch>`. Then check that the new run's `headSha` is the trail head.

## Health check (read only, any time)

- Compare the heads and tags from `git ls-remote` on both sides (minus `entire/*`).
- Grep GitHub's refs for `entire/`.
- Run `gh run list -R $R -L 4` to see the latest `CI` and `Report to Entire`.
