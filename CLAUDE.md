# ib2web: migrate the research group website from Hugo/Wowchemy to Quarto

## Situation

- Old site: https://bioinfo-recetox.github.io (also reached via a redirect from
  https://bioinfo.recetox.muni.cz). Built with Hugo + Wowchemy 5.6.0.
- `legacy/` contains the Hugo source of the old site. It is READ-ONLY reference material.
  Never modify, move or delete anything in it.
- The new Quarto website project lives in the root of `ib2web/` and will be hosted on
  GitHub (see "GitHub and deployment").
- The owner updates the site rarely and forgets its structure every time. The top priority
  is LOW MAINTENANCE: few concepts, plain files, one obvious place for each kind of
  content, a pinned Quarto version, and a README with "how to add X" recipes.
- The owner is a bioinformatician with strong Linux/CLI skills. No hand-holding is needed
  on the command line, but explain design choices.

## Hard constraints

- **Do NOT install Hugo or Go, and do not try to build the legacy site locally.**
  The old site needs a very old Hugo version and is not worth reviving. Read the legacy
  source as plain text, and use the published site (https://bioinfo-recetox.github.io) as
  the visual reference.
- Do not install software or change system configuration without asking. Report what is
  missing and propose how to install it (package manager, version).
- Do not push to GitHub, create remote repositories, or change GitHub settings without
  explicit confirmation. Never handle tokens or credentials.
- Work on a git branch and commit in small, well-described steps.
- Prefer the Python standard library for conversion scripts. If a package is needed
  (e.g. PyYAML, bibtexparser), propose a virtual environment first.

## Decisions already made

- Generator: Quarto (website project). Not Jekyll, not Hugo.
- Publications: ONE `.bib` file drives a filterable publications page. No per-paper pages.
  Take entries from each legacy publication folder's `cite.bib` where available, falling
  back to its front matter. Report every entry that had to be reconstructed.
- Tags: legacy tags become Quarto categories.
- People: one `people.yml` (name, role, photo, bio, links, research interests, alumni
  flag), rendered first as Quarto's built-in grid listing. Keep data and presentation
  separate, because a custom card design and animations come later.
- News: one dated markdown/qmd file per item.
- Projects/code: a YAML list of repositories.
- URLs: keep the old paths (/publication, /people, /post, tag paths) or provide redirects
  via `aliases`. Existing links from papers and grants must not break.
- Wowchemy home-page widgets and the slider have no equivalent. Rebuild them as a simple
  layout.
- Theme: approximate the current look (colors, fonts, logo, favicon) with a Bootswatch
  theme plus a little SCSS.
- Custom people cards and animations are a later phase, built on the same data files.

## GitHub and deployment

The code will live in a GitHub repository and be published with GitHub Pages via GitHub
Actions. Prepare for that from the start.

- The new repo should contain source only (`.qmd`, data files, media, config). Add
  `_site/`, `.quarto/`, and `legacy/` to `.gitignore` unless the owner decides otherwise.
- Use relative links and configure `site-url` and `repo-url` in `_quarto.yml`, so the site
  works both at a project URL (`https://bioinfo-recetox.github.io/<repo>/`) during testing
  and at the root URL after cutover. Enable "edit this page" and "report an issue" links
  (`repo-actions`) so small edits can be done from the GitHub web UI.
- Provide `.github/workflows/publish.yml`:
  - Triggers: push to `main` (build and deploy), pull requests (build only, to catch
    breakage), and manual `workflow_dispatch`.
  - Pin the Quarto version in ONE place (an env variable) and keep it identical to the
    version used locally.
  - Use the GitHub Pages "GitHub Actions" source: `actions/configure-pages`, render,
    `actions/upload-pages-artifact`, `actions/deploy-pages`, with the minimal permissions
    (`contents: read`, `pages: write`, `id-token: write`) and a `concurrency` group.
  - Pin action versions. Optionally add a link check (e.g. lychee) as a separate,
    non-blocking job.
- Do NOT commit generated output (`_site/`) and do not add a `.nojekyll` file, because
  artifact-based deployment does not need it.
- Cutover from the old site is a design choice. When the site is ready, present the
  options and trade-offs and let the owner decide. Candidates:
  1. Test in a separate repo first (project URL), then replace the contents of
     `bioinfo-recetox/bioinfo-recetox.github.io` with the new source and switch its
     Pages source to GitHub Actions. Preserve the old built output on an `archive` branch or tag.
  2. Move/rename repositories so the new repo becomes `bioinfo-recetox.github.io`.
  Keep the redirect from `bioinfo.recetox.muni.cz` working. It is configured outside
  the repo, so the URL `https://bioinfo-recetox.github.io` must stay valid.
- Write a short `DEPLOY.md` covering what to change in the GitHub repository settings
  (Pages source, branch protection if wanted), how to roll back, and how to test a build
  locally.

## Working style

- Step -1 and step 0 come first: report the environment check and the inventory, together
  with any design questions, BEFORE converting anything.
- When there is a real design choice, give options and trade-offs first and let the owner
  choose before building. Do not jump straight to implementation.
- After each step, run `quarto render` and report warnings, broken links and missing images.
- Keep the final structure obvious. A newcomer should be able to guess where a new paper,
  person or news item goes.

## Steps

-1. **Environment check (report only, do not install):**
   - `quarto --version` and `quarto check`. Report the version. The owner picks the version to pin.
   - `git --version`, and whether `legacy/` is a git repo (Hugo source history).
   - `python3 --version`.
   - Optional: ImageMagick (image resizing), `gh` CLI, a link checker such as lychee.
   - Hugo and Go are NOT needed and must not be installed.
   - No R, Python or Julia runtime is required to render a pure-markdown Quarto site.
     Quarto bundles pandoc, Deno and Sass.
0. **Inventory of `legacy/` and report:** sections, front-matter fields, taxonomies, menus,
   redirects/aliases, custom layouts and shortcodes, widgets, media, `go.mod`/config,
   and anything surprising. Present it together with open design questions.
1. Scaffold the Quarto project: `_quarto.yml`, `.gitignore`, pinned version, folder layout.
2. Create the data files: `people.yml`, `publications.bib`, `projects.yml`.
3. Convert news, people, projects and media.
4. Build pages and listings: home, news, people, publications (with category filters),
   projects, contact.
5. Theme and branding.
6. Old-URL compatibility and redirects.
7. GitHub Actions workflow and `DEPLOY.md` (as described above). Test in a separate repo
   or project URL before any cutover.
8. `README.md` with recipes: add a paper, add a person, add a news item, preview locally,
   upgrade Quarto. Optionally a small scaffold script (e.g. new news item from a
   template, add a paper from a DOI).
9. Later: custom people cards and animations.
