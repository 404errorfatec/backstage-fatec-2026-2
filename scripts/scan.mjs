import fs from 'node:fs/promises';
import path from 'node:path';

const MOCK_DIR = path.resolve('mock-projects');
const OUTPUT_FILE = path.resolve('src/data/projects.json');

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=400';


function formatTag(name) {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

async function scanProjects() {
  console.log('🔍 Lendo diretórios em mock-projects/...');

  // 1. Ler os diretórios de mock-projects/ usando fs.readdir
  const dirents = await fs.readdir(MOCK_DIR, { withFileTypes: true });
  const projectDirs = dirents.filter((d) => d.isDirectory());

  const projects = [];
  let id = 1;

  for (const dirent of projectDirs) {
    const projectPath = path.join(MOCK_DIR, dirent.name);
    const pkgPath = path.join(projectPath, 'package.json');

    // 2. Abrir o package.json de cada subpasta com fs.readFile e fazer JSON.parse
    let pkg;
    try {
      const raw = await fs.readFile(pkgPath, 'utf-8');
      pkg = JSON.parse(raw);
    } catch (err) {
      console.warn(`⚠️  Ignorando "${dirent.name}": sem package.json válido (${err.message})`);
      continue;
    }

    // 3. Extrair name, description e as bibliotecas em dependencies para gerar as tags
    const title = pkg.name || dirent.name;
    const description = pkg.description || 'Descrição não fornecida.';
    const tags = Object.keys(pkg.dependencies || {}).map(formatTag);

    // 4. Gerar o formato exato esperado por src/data/projects.json
    projects.push({
      id: String(id++),
      title,
      professor: 'Orientador a definir',
      description,
      tags,
      image: DEFAULT_IMAGE,
      githubUrl: '#',
    });

    console.log(`  ✓ ${dirent.name} -> "${title}" (${tags.length} tag(s))`);
  }

  // Gravar em src/data/projects.json via fs.writeFile
  await fs.writeFile(OUTPUT_FILE, JSON.stringify(projects, null, 2) + '\n', 'utf-8');

  console.log(`\n✅ ${projects.length} projeto(s) escritos em ${path.relative('.', OUTPUT_FILE)}`);
}

scanProjects().catch((err) => {
  console.error('❌ Erro ao escanear os projetos:', err);
  process.exit(1);
});
