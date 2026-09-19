# Maintenance

How to make the common day-to-day changes to this site. Every recipe below
is "edit one file, then run `quarto render` (or check it with `quarto
preview` first)."

## Add a person

Edit [`people.yml`](people.yml): copy an existing entry and adjust it.
`group` must be one of `PIs`, `Postdocs`, `Doctoral students`, `Alumni` — the
People page always shows these four sections, even when one is empty. Add a
photo to `media/people/<key>.jpg` and reference it as `photo:` in the entry.

## Add a project

Edit [`projects.yml`](projects.yml): copy an existing entry. Use
`kind: research` for a grant-funded project (with a full `body` in Markdown)
or `kind: tool` for a short software/tool entry (just links). Add a featured
image to `media/projects/<key>.jpg` if you have one and reference it as
`image:`.

## Add a publication

Add a BibTeX entry to [`publications.bib`](publications.bib) — pasting the
publisher's own BibTeX export is the easiest way. Add a `keywords` field
(comma-separated, matching the tags used elsewhere, e.g. `crc, biomarkers`)
so it shows up under the category filter on the Publications page.

## Add a news item

Create a new file in [`news/`](news/), named `YYYY-MM-DD-short-slug.qmd`,
with front matter like:

```yaml
---
title: "Your headline"
date: 2026-01-15
author: Your Name
categories: [tag1, tag2]   # optional
image: ../media/news/your-image.jpg   # optional
---
```

followed by the item's text in Markdown. It shows up automatically on the
News page (newest first).

## Add an event

Create a new file in [`events/`](events/), named `YYYY-MM-DD-short-slug.qmd`,
the same way as a news item (see above). The Events page (`events/index.qmd`)
is currently a plain placeholder since there's never been a real event yet —
the first time you add one, replace its body with a `listing:` block copied
from `news/index.qmd`'s front matter (pointing at `events/`) to turn it into
an automatic listing.

## Preview locally

```
quarto preview
```

Opens the site in your browser and rebuilds pages as you edit them.

## Upgrade Quarto

The version is pinned in exactly one place: the `QUARTO_VERSION` environment
variable in `.github/workflows/publish.yml`. Install the same version
locally (see `DEPLOY.md`) so local previews match what CI builds.
