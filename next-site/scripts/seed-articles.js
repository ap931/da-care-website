const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const vm = require("node:vm");
const { createClient } = require("@sanity/client");

const ROOT = process.cwd();
const ARTICLES_PATH = path.join(ROOT, "public", "js", "articles.js");
const ENV_FILES = [path.join(ROOT, ".env.local"), path.join(ROOT, ".env")];

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    if (!line || line.trim().startsWith("#")) continue;
    const match = line.match(/^([^=]+)=(.*)$/);
    if (!match) continue;
    const key = match[1].trim();
    let value = match[2].trim();
    if (
      (value.startsWith("\"") && value.endsWith("\"")) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

ENV_FILES.forEach(loadEnvFile);

const projectId = process.env.SANITY_PROJECT_ID;
const dataset = process.env.SANITY_DATASET;
const token = process.env.SANITY_TOKEN;
const apiVersion = process.env.SANITY_API_VERSION || "2026-03-01";

if (!projectId || !dataset || !token) {
  console.error("Missing Sanity credentials.");
  console.error("Ensure SANITY_PROJECT_ID, SANITY_DATASET, and SANITY_TOKEN are set.");
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token,
});

function key() {
  return crypto.randomUUID();
}

function getImagePath(src) {
  if (!src) return null;
  const trimmed = String(src).trim();
  if (!trimmed.startsWith("/")) return path.join(ROOT, "public", trimmed);
  return path.join(ROOT, "public", trimmed.replace(/^\//, ""));
}

async function ensureImageAsset(src) {
  if (!src) return null;
  const filePath = getImagePath(src);
  if (!filePath || !fs.existsSync(filePath)) {
    console.warn(`Image not found: ${src}`);
    return null;
  }
  const filename = path.basename(filePath);
  const existing = await client.fetch(
    '*[_type == "sanity.imageAsset" && originalFilename == $name][0]{_id}',
    { name: filename }
  );
  if (existing && existing._id) return existing._id;
  const stream = fs.createReadStream(filePath);
  const asset = await client.assets.upload("image", stream, { filename });
  return asset._id;
}

function extractArticles() {
  const source = fs.readFileSync(ARTICLES_PATH, "utf8");
  const match = source.match(/window\.daCareArticles\s*=\s*(\[[\s\S]*?\])\s*;/);
  if (!match) {
    throw new Error("Unable to locate daCareArticles array in articles.js");
  }
  const arrayLiteral = match[1];
  return vm.runInNewContext(arrayLiteral, {});
}

async function buildDocs() {
  const articles = extractArticles();
  const docs = [];
  for (let index = 0; index < articles.length; index += 1) {
    const article = articles[index];
    const heroAsset = await ensureImageAsset(article.image);
    const thumbAsset = await ensureImageAsset(article.thumbnail);
    const content = [];
    for (const block of article.content || []) {
      if (block.type === "img") {
        const imgAsset = await ensureImageAsset(block.src);
        content.push({
          _key: key(),
          type: "img",
          image: imgAsset
            ? {
                _type: "image",
                asset: { _type: "reference", _ref: imgAsset },
                ...(block.alt ? { alt: block.alt } : {}),
              }
            : undefined,
        });
      } else {
        content.push({
          _key: key(),
          type: block.type,
          text: block.text,
        });
      }
    }
    docs.push({
      _id: `article-${article.id}`,
      _type: "article",
      order: index,
      slug: article.id,
      title: article.title,
      date: article.date,
      readTime: article.readTime,
      excerpt: article.excerpt,
      image: heroAsset
        ? {
            _type: "image",
            asset: { _type: "reference", _ref: heroAsset },
            ...(article.title ? { alt: article.title } : {}),
          }
        : undefined,
      thumbnail: thumbAsset
        ? {
            _type: "image",
            asset: { _type: "reference", _ref: thumbAsset },
            ...(article.title ? { alt: article.title } : {}),
          }
        : undefined,
      content,
    });
  }
  return docs;
}

async function run() {
  const docs = await buildDocs();
  for (const doc of docs) {
    await client.createOrReplace(doc);
  }
  console.log("Articles seeded in Sanity.");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
