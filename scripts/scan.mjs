import { readdir, readFile, writeFile, access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PROJECTS_DIR = path.join(ROOT, "mock-projects");
const OUTPUT_FILE = path.join(ROOT, "src", "data", "projects.json");

const CONFORMITY_CHECKS = [
  { key: "readme", files: ["README.md", "readme.md"] },
  { key: "gitignore", files: [".gitignore"] },
  { key: "tests", files: ["test", "tests", "__tests__"], scriptKey: "test" },
];

async function exists(target) {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
}

async function checkConformity(projectPath, packageJson) {
  const conformity = {};

  for (const check of CONFORMITY_CHECKS) {
    let found = false;

    for (const file of check.files) {
      if (await exists(path.join(projectPath, file))) {
        found = true;
        break;
      }
    }

    if (!found && check.scriptKey) {
      found = Boolean(packageJson.scripts?.[check.scriptKey]);
    }

    conformity[check.key] = found;
  }

  return conformity;
}

function scoreProject(conformity) {
  const total = Object.keys(conformity).length;
  const passed = Object.values(conformity).filter(Boolean).length;
  return Math.round((passed / total) * 100);
}

function extractTags(packageJson) {
  const dependencies = Object.keys(packageJson.dependencies ?? {});
  return dependencies;
}

function parseRequirements(content) {
  return content
    .split("\n")
    .map((line) => line.split("#")[0].trim())
    .filter((line) => line && !line.startsWith("-"))
    .map((line) => line.split(/[<>=!~;\[ ]/)[0]);
}

async function readManifest(projectPath) {
  const packageJsonPath = path.join(projectPath, "package.json");
  if (await exists(packageJsonPath)) {
    const packageJson = JSON.parse(await readFile(packageJsonPath, "utf-8"));
    return { manifest: packageJson, tags: extractTags(packageJson) };
  }

  const requirementsPath = path.join(projectPath, "requirements.txt");
  if (await exists(requirementsPath)) {
    const tags = parseRequirements(await readFile(requirementsPath, "utf-8"));
    return { manifest: {}, tags };
  }

  return null;
}

async function scanProject(dirName) {
  const projectPath = path.join(PROJECTS_DIR, dirName);
  const result = await readManifest(projectPath);

  if (!result) {
    return null;
  }

  const { manifest, tags } = result;
  const conformity = await checkConformity(projectPath, manifest);

  return {
    id: dirName,
    title: manifest.name ?? dirName,
    description: manifest.description ?? "",
    tags,
    conformity,
    score: scoreProject(conformity),
  };
}

async function main() {
  const entries = await readdir(PROJECTS_DIR, { withFileTypes: true });
  const dirNames = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);

  const projects = (await Promise.all(dirNames.map(scanProject))).filter(Boolean);

  await writeFile(OUTPUT_FILE, JSON.stringify(projects, null, 2) + "\n", "utf-8");

  console.log(`✔ ${projects.length} projeto(s) escaneado(s) em mock-projects/`);
  console.log(`✔ Resultado gravado em ${path.relative(ROOT, OUTPUT_FILE)}`);
}

main().catch((error) => {
  console.error("Erro ao escanear projetos:", error);
  process.exitCode = 1;
});
