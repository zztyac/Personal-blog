import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

const uploadsRoot = path.join(process.cwd(), "public", "uploads");

function normalizeFileExtension(file: File) {
  const rawExt = path.extname(file.name || "").toLowerCase();

  if (rawExt) {
    return rawExt;
  }

  if (file.type === "image/png") return ".png";
  if (file.type === "image/jpeg") return ".jpg";
  if (file.type === "image/webp") return ".webp";
  if (file.type === "image/gif") return ".gif";
  if (file.type === "image/svg+xml") return ".svg";

  return ".bin";
}

function normalizeSegment(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function getUploadTarget(folder: string, file: File) {
  const now = new Date();
  const year = String(now.getUTCFullYear());
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const baseFolder = normalizeSegment(folder) || "misc";
  const ext = normalizeFileExtension(file);
  const filename = `${Date.now()}-${randomUUID().slice(0, 8)}${ext}`;
  const relativeDir = path.join(baseFolder, year, month);
  const relativeUrlDir = `/uploads/${baseFolder}/${year}/${month}`;

  return {
    diskDir: path.join(uploadsRoot, relativeDir),
    publicUrl: `${relativeUrlDir}/${filename}`,
    diskPath: path.join(uploadsRoot, relativeDir, filename)
  };
}

export async function persistUploadedFile(file: File, folder: string) {
  const target = getUploadTarget(folder, file);
  await mkdir(target.diskDir, { recursive: true });
  const arrayBuffer = await file.arrayBuffer();
  await writeFile(target.diskPath, Buffer.from(arrayBuffer));

  return target.publicUrl;
}

export async function rewriteMarkdownLocalImages(markdown: string, files: File[]) {
  if (files.length === 0) {
    return markdown;
  }

  const replacements = new Map<string, string>();
  const imagePattern = /!\[[^\]]*]\(([^)]+)\)/g;
  const matches = [...markdown.matchAll(imagePattern)];

  for (const match of matches) {
    const originalPath = match[1]?.trim();

    if (!originalPath || /^(https?:)?\/\//i.test(originalPath) || originalPath.startsWith("data:") || originalPath.startsWith("/")) {
      continue;
    }

    const filename = path.posix.basename(originalPath.replace(/\\/g, "/"));
    const asset = files.find((file) => file.name === filename);

    if (!asset) {
      continue;
    }

    if (!replacements.has(originalPath)) {
      const url = await persistUploadedFile(asset, "markdown-inline");
      replacements.set(originalPath, url);
    }
  }

  let output = markdown;

  for (const [originalPath, uploadedUrl] of replacements.entries()) {
    output = output.split(`(${originalPath})`).join(`(${uploadedUrl})`);
  }

  return output;
}
