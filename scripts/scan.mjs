#!/usr/bin/env node
// scripts/scan.mjs
//
// Uso:
//   node scripts/scan.mjs https://github.com/owner/repo
//   node scripts/scan.mjs --local mock-projects/app-gestao-estoque
//
// Variável de ambiente opcional GITHUB_TOKEN aumenta o limite de requisições
// da API do GitHub (60/h sem token, 5000/h com token).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { computeScore } from './lib/scoring.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUTPUT_PATH = path.join(ROOT, 'src', 'data', 'projects.json');

const GITHUB_API = 'https://api.github.com';
const token = process.env.GITHUB_TOKEN;
const ghHeaders = {
  Accept: 'application/vnd.github+json',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
};

function parseRepoUrl(url) {
  const match = url.match(/github\.com\/([^/]+)\/([^/#]+?)(?:\.git)?\/?$/i);
  if (!match) throw new Error(`URL de repositório GitHub inválida: ${url}`);
  return { owner: match[1], repo: match[2] };
}

async function ghJson(url) {
  const res = await fetch(url, { headers: ghHeaders });
  if (!res.ok) {
    throw new Error(`GitHub API ${res.status} em ${url}: ${await res.text()}`);
  }
  return res.json();
}

async function fetchRawFile(owner, repo, branch, filePath) {
  const res = await fetch(
    `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`
  );
  if (!res.ok) return null;
  return res.text();
}

async function scanRemote(repoUrl) {
  const { owner, repo } = parseRepoUrl(repoUrl);
  const meta = await ghJson(`${GITHUB_API}/repos/${owner}/${repo}`);
  const branch = meta.default_branch;

  const treeRes = await ghJson(
    `${GITHUB_API}/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`
  );
  const fileList = treeRes.tree.filter((t) => t.type === 'blob').map((t) => t.path);

  const [gitignoreContent, packageJsonContent] = await Promise.all([
    fileList.some((f) => f === '.gitignore')
      ? fetchRawFile(owner, repo, branch, '.gitignore')
      : null,
    fileList.some((f) => f === 'package.json')
      ? fetchRawFile(owner, repo, branch, 'package.json')
      : null,
  ]);

  const score = computeScore(fileList, {
    gitignoreContent,
    packageJsonContent,
    pushedAt: meta.pushed_at,
  });

  return {
    id: meta.full_name,
    source: 'github',
    name: meta.name,
    owner: meta.owner.login,
    url: meta.html_url,
    description: meta.description,
    stars: meta.stargazers_count,
    openIssues: meta.open_issues_count,
    pushedAt: meta.pushed_at,
    scannedAt: new Date().toISOString(),
    ...score,
  };
}

function walkLocal(dir, base = dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkLocal(full, base, acc);
    } else {
      acc.push(path.relative(base, full).split(path.sep).join('/'));
    }
  }
  return acc;
}

async function scanLocal(relDir) {
  const dir = path.resolve(ROOT, relDir);
  if (!fs.existsSync(dir)) throw new Error(`Pasta não encontrada: ${dir}`);

  const fileList = walkLocal(dir);
  const gitignoreContent = fileList.includes('.gitignore')
    ? fs.readFileSync(path.join(dir, '.gitignore'), 'utf-8')
    : null;
  const packageJsonContent = fileList.includes('package.json')
    ? fs.readFileSync(path.join(dir, 'package.json'), 'utf-8')
    : null;

  let pushedAt = null;
  try {
    pushedAt = fs.statSync(dir).mtime.toISOString();
  } catch {
    /* ignore */
  }

  const score = computeScore(fileList, { gitignoreContent, packageJsonContent, pushedAt });
  const name = path.basename(dir);

  return {
    id: `local/${name}`,
    source: 'local',
    name,
    owner: 'local',
    url: null,
    description: `Pasta local: ${relDir}`,
    stars: null,
    openIssues: null,
    pushedAt,
    scannedAt: new Date().toISOString(),
    ...score,
  };
}

function saveResult(result) {
  let existing = [];
  if (fs.existsSync(OUTPUT_PATH)) {
    existing = JSON.parse(fs.readFileSync(OUTPUT_PATH, 'utf-8'));
  }
  const filtered = existing.filter((p) => p.id !== result.id);
  filtered.push(result);
  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(filtered, null, 2) + '\n');
}

async function main() {
  const [, , flagOrUrl, maybePath] = process.argv;

  if (!flagOrUrl) {
    console.error('Uso: node scripts/scan.mjs <url-do-github> | --local <pasta>');
    process.exit(1);
  }

  let result;
  try {
    if (flagOrUrl === '--local') {
      if (!maybePath) throw new Error('Informe a pasta: --local mock-projects/app-gestao-estoque');
      result = await scanLocal(maybePath);
    } else {
      result = await scanRemote(flagOrUrl);
    }
  } catch (err) {
    console.error(`Erro ao escanear: ${err.message}`);
    process.exit(1);
  }

  saveResult(result);

  console.log(`\n${result.name} — nota ${result.total}/100 (${result.grade})`);
  for (const item of result.breakdown) {
    const mark = item.achieved ? '✔' : '✘';
    console.log(`  ${mark} ${item.label} [${item.points}/${item.max}]${item.detail ? ` — ${item.detail}` : ''}`);
  }
  console.log(`\nSalvo em ${path.relative(ROOT, OUTPUT_PATH)}`);
}

main();
