// Quarto pre-render hook (runs automatically via Quarto's bundled Deno,
// declared in _quarto.yml under project.pre-render).
//
// Regenerates _generated/*.json from the site's real data files
// (people.yml, projects.yml, publications.bib) before every render.
// The pages under people.qmd/projects.qmd/publications.qmd load these
// JSON files client-side (via OJS FileAttachment) to build filterable
// listings straight from the site's data.
//
// _generated/ is gitignored: never edit its contents directly, and never
// edit this script's output by hand -- edit the source data file instead
// and re-render.
//
// IMPORTANT: this hook runs before EVERY render, including a `quarto
// preview` re-render of a single unrelated page (e.g. just clicking a nav
// link re-renders that one page, but the project-level pre-render hook
// still runs). Each output file is only actually (re)written if its
// content changed, via writeIfChanged() below. Without this, rewriting
// _generated/*.json on every render -- even when nothing in people.yml/
// projects.yml/publications.bib changed -- makes Quarto's preview file
// watcher think a shared resource changed on every navigation, which
// triggers an extra, unscoped "reload everything" broadcast that races
// with (and can cancel) the browser's in-flight navigation to whatever
// page was actually clicked.

import { parse as parseYaml } from "jsr:@std/yaml@1";

const outDir = "_generated";
await Deno.mkdir(outDir, { recursive: true });

async function writeIfChanged(path: string, content: string): Promise<void> {
  try {
    const existing = await Deno.readTextFile(path);
    if (existing === content) return;
  } catch {
    // file doesn't exist yet -- fall through and write it
  }
  await Deno.writeTextFile(path, content);
}

async function markdownToHtml(markdown: string): Promise<string> {
  if (!markdown || !markdown.trim()) return "";
  const cmd = new Deno.Command("quarto", {
    args: ["pandoc", "-f", "markdown", "-t", "html"],
    stdin: "piped",
    stdout: "piped",
    stderr: "inherit",
  });
  const child = cmd.spawn();
  const writer = child.stdin.getWriter();
  await writer.write(new TextEncoder().encode(markdown));
  await writer.close();
  const { success, stdout } = await child.output();
  if (!success) {
    throw new Error("quarto pandoc failed converting a project body to HTML");
  }
  return new TextDecoder().decode(stdout);
}

// people.yml -> _generated/people.json (verbatim, no transformation needed)
{
  const text = await Deno.readTextFile("people.yml");
  const data = parseYaml(text);
  await writeIfChanged(`${outDir}/people.json`, JSON.stringify(data));
}

// projects.yml -> _generated/projects.json (each `body` also rendered to HTML)
{
  const text = await Deno.readTextFile("projects.yml");
  const data = parseYaml(text) as Record<string, unknown>[];
  for (const item of data) {
    if (typeof item.body === "string") {
      item.bodyHtml = await markdownToHtml(item.body);
    }
  }
  await writeIfChanged(`${outDir}/projects.json`, JSON.stringify(data));
}

// publications.bib -> _generated/publications.json (CSL-JSON, via Quarto's
// bundled pandoc -- this is what carries the `keyword` field used to filter
// the Publications page by category).
{
  const cmd = new Deno.Command("quarto", {
    args: ["pandoc", "publications.bib", "-t", "csljson"],
    stdout: "piped",
    stderr: "inherit",
  });
  const { success, stdout } = await cmd.output();
  if (!success) {
    throw new Error("quarto pandoc failed converting publications.bib to CSL-JSON");
  }
  await writeIfChanged(`${outDir}/publications.json`, new TextDecoder().decode(stdout));
}

console.log(`Checked ${outDir}/{people,projects,publications}.json (only rewritten if changed)`);
