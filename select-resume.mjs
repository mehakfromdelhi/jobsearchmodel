import fs from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const resumesDir = path.join(projectRoot, "resumes");
const variants = loadVariants();

const arg = process.argv[2];

if (!arg || arg === "--list") {
  console.log("Available resume variants:");
  for (const key of Object.keys(variants).sort()) {
    console.log(`- ${key}`);
  }
  process.exit(0);
}

const selected = variants[arg.toLowerCase()];
if (!selected) {
  console.error(`Unknown resume variant: ${arg}`);
  console.error("Run `npm run resume -- --list` to see valid options.");
  process.exit(1);
}

const source = path.join(projectRoot, selected);
const destination = path.join(projectRoot, "cv.md");

if (!fs.existsSync(source)) {
  console.error(`Source file not found: ${source}`);
  process.exit(1);
}

fs.copyFileSync(source, destination);
console.log(`Active cv.md updated from ${selected}`);

function loadVariants() {
  if (!fs.existsSync(resumesDir)) return {};
  const files = fs
    .readdirSync(resumesDir)
    .filter((file) => file.endsWith(".md") && file.toLowerCase() !== "readme.md");
  return Object.fromEntries(
    files.map((file) => {
      const slug = file.replace(/\.md$/i, "").toLowerCase();
      return [slug, path.join("resumes", file)];
    })
  );
}
