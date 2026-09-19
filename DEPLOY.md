# Deploy

How this site gets from a git push to a live page, what to change in GitHub's
settings, and how to roll back if something goes wrong.

## How it works

`.github/workflows/publish.yml` renders the site with Quarto and publishes
it via GitHub Pages' "GitHub Actions" deployment source (not the older
"deploy from a branch" option — there's no `gh-pages` branch and no
`_site/` committed anywhere).

- **Push to `main`**: renders and deploys.
- **Pull request**: renders only, to catch a broken build before merging —
  nothing gets deployed.
- **Manual run** (`workflow_dispatch`, from the Actions tab): renders and
  deploys, useful for re-publishing without a new commit (e.g. after
  changing a repository setting).
- A separate, non-blocking `link-check` job runs [lychee](https://github.com/lycheeverse/lychee)
  against the rendered site and reports broken links without failing the
  build.

The Quarto version is pinned in exactly one place: the `QUARTO_VERSION` env
var at the top of `publish.yml`. Keep it identical to the version installed
locally (see `MAINTENANCE.md` > "Upgrade Quarto").

## One-time repository setup

In the GitHub repository's **Settings → Pages**:

- **Source**: "GitHub Actions" (not "Deploy from a branch").

That's the only required setting. Optional, if you want it:

- **Settings → Branches → Branch protection rule** for `main`, requiring
  the `build` check to pass before merging a PR — catches a broken render
  before it reaches `main`.

## Cutover to bioinfo-recetox.github.io

The confirmed final URL is `https://bioinfo-recetox.github.io/`, which
means this repository's source needs to end up living in the
`bioinfo-recetox/bioinfo-recetox.github.io` repository (a `<user>.github.io`
repo is what GitHub serves at the account's root Pages URL — there's no way
to get the root URL from a differently-named repo).

Recommended order, so nothing is ever broken or lost:

1. **Test first, somewhere else.** Push this repo's source to a *new*,
   separate GitHub repository (any name) with Pages source set to "GitHub
   Actions". It will publish at a project URL like
   `https://bioinfo-recetox.github.io/<that-repo-name>/` — good enough to
   click through the whole site for real before touching the live one.
2. **Preserve the old site.** In the current
   `bioinfo-recetox/bioinfo-recetox.github.io` repository, create a branch
   or tag (e.g. `archive-hugo`) from its current `main`/`master`, so the old
   Hugo source and its last built output stay recoverable.
3. **Replace the content.** Once step 1 looks right, replace the contents
   of `bioinfo-recetox/bioinfo-recetox.github.io`'s default branch with this
   project's source (e.g. push this repo's history onto it, or copy the
   files over in a single commit — either way, keep the `archive-hugo`
   ref pointing at the old state).
4. **Flip the Pages source** on `bioinfo-recetox/bioinfo-recetox.github.io`
   to "GitHub Actions" (Settings → Pages, same as above).
5. **Nothing to do for the custom domain.** The `bioinfo.recetox.muni.cz`
   redirect points at `https://bioinfo-recetox.github.io` itself, which
   doesn't change through any of this.

`site-url` and `repo-url` in `_quarto.yml` already assume the final
`bioinfo-recetox.github.io` repo name — no config changes needed at cutover
time, only during the temporary test-elsewhere step (point `repo-url` at
whatever the test repo is called, then change it back before the real
cutover).

## Rolling back

Since deployment is artifact-based (nothing is committed to a branch),
rolling back is a normal git operation:

- **Revert the bad commit** on `main` (`git revert <sha>`) and push — the
  workflow re-deploys the previous, working version automatically.
- **Re-run an old successful workflow run** instead, from the Actions tab
  ("Re-run all jobs") if you just want last week's build back without
  touching git history.
- The live site is never in an in-between state: a deploy only replaces
  the previous one once the whole render succeeds.

## Testing a build locally

```
quarto render
```

Then either open `_site/index.html` directly, or serve it properly (some
things, like the OJS-driven Projects/Publications filters, need to be
fetched over HTTP rather than opened as a local `file://` path):

```
quarto preview
```

Both commands use the `pre-render` hook (`scripts/prepare-data.ts`)
automatically — no separate build step needed.
