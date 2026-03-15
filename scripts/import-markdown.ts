import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { parseMarkdownDocument } from "@/lib/markdown/import";

async function main() {
  const contentDir = path.join(process.cwd(), "content", "imports");
  const filenames = await readdir(contentDir);
  const markdownFiles = filenames.filter((name) => name.endsWith(".md"));

  for (const filename of markdownFiles) {
    const fullPath = path.join(contentDir, filename);
    const source = await readFile(fullPath, "utf8");
    const document = parseMarkdownDocument(source);
    console.log(`Parsed ${filename}:`, {
      title: document.title,
      slug: document.slug,
      topic: document.topic,
      status: document.status
    });
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
