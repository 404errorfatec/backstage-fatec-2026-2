// scripts/lib/scoring.mjs
// Regras de pontuação do "Backstage FATEC".
// Cada critério tem um peso fixo; a soma máxima é 100 pontos.

const SENSITIVE_PATTERNS = [/^\.env/i, /\.pem$/i, /\.key$/i, /credentials/i, /secrets?\./i];
const TEST_PATTERNS = [/^tests?\//i, /^__tests__\//i, /\.test\.[jt]sx?$/i, /\.spec\.[jt]sx?$/i, /^spec\//i];
const MANIFEST_FILES = ['package.json', 'requirements.txt', 'pom.xml', 'go.mod', 'Cargo.toml', 'build.gradle'];

const WEIGHTS = {
  readme: 15,
  license: 5,
  gitignorePresent: 10,
  gitignoreCoverage: 10,
  noLeakedSecrets: 15,
  tests: 15,
  manifest: 10,
  ci: 10,
  recentActivity: 10,
};

function hasFile(fileList, name) {
  return fileList.some((f) => f.toLowerCase() === name.toLowerCase());
}

function hasReadme(fileList) {
  return fileList.some((f) => /^readme(\.md|\.txt)?$/i.test(f));
}

function hasLicense(fileList) {
  return fileList.some((f) => /^license(\.md|\.txt)?$/i.test(f));
}

function hasCi(fileList) {
  return fileList.some((f) => f.startsWith('.github/workflows/'));
}

function findLeakedSecrets(fileList) {
  return fileList.filter((f) => SENSITIVE_PATTERNS.some((p) => p.test(f)));
}

function hasTests(fileList) {
  return fileList.some((f) => TEST_PATTERNS.some((p) => p.test(f)));
}

function detectManifest(fileList) {
  return MANIFEST_FILES.find((m) => hasFile(fileList, m)) || null;
}

function gitignoreCoversSecrets(gitignoreContent) {
  if (!gitignoreContent) return false;
  const lines = gitignoreContent
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  const coversEnv = lines.some((l) => l.startsWith('.env'));
  const coversKeys = lines.some((l) => /\*\.(pem|key)/.test(l));
  return coversEnv || coversKeys;
}

function detectStack(packageJsonContent) {
  if (!packageJsonContent) return [];
  try {
    const pkg = JSON.parse(packageJsonContent);
    const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
    const known = {
      react: 'React',
      vue: 'Vue',
      express: 'Express',
      next: 'Next.js',
      vite: 'Vite',
      typescript: 'TypeScript',
      jest: 'Jest',
      vitest: 'Vitest',
      '@nestjs/core': 'NestJS',
      tailwindcss: 'TailwindCSS',
    };
    return Object.keys(known)
      .filter((dep) => deps[dep])
      .map((dep) => known[dep]);
  } catch {
    return [];
  }
}

function gradeFor(total) {
  if (total >= 90) return 'A';
  if (total >= 75) return 'B';
  if (total >= 60) return 'C';
  if (total >= 40) return 'D';
  return 'F';
}

/**
 * @param {string[]} fileList - caminhos relativos de todos os arquivos do repositório
 * @param {object} opts
 * @param {string|null} opts.gitignoreContent
 * @param {string|null} opts.packageJsonContent
 * @param {string|null} opts.pushedAt - ISO date da última atividade (push/commit)
 */
export function computeScore(fileList, opts = {}) {
  const { gitignoreContent = null, packageJsonContent = null, pushedAt = null } = opts;

  const breakdown = [];
  let total = 0;

  const add = (key, label, achieved, detail) => {
    const points = achieved ? WEIGHTS[key] : 0;
    total += points;
    breakdown.push({ key, label, points, max: WEIGHTS[key], achieved, detail });
  };

  add('readme', 'README presente', hasReadme(fileList));
  add('license', 'Licença (LICENSE) presente', hasLicense(fileList));

  const gitignorePresent = hasFile(fileList, '.gitignore');
  add('gitignorePresent', '.gitignore presente', gitignorePresent);
  add(
    'gitignoreCoverage',
    '.gitignore cobre arquivos sensíveis (.env, *.key, *.pem)',
    gitignorePresent && gitignoreCoversSecrets(gitignoreContent)
  );

  const leaked = findLeakedSecrets(fileList);
  add(
    'noLeakedSecrets',
    'Nenhum arquivo sensível versionado (.env, *.pem, *.key, credentials)',
    leaked.length === 0,
    leaked.length ? `Encontrados: ${leaked.join(', ')}` : undefined
  );

  add('tests', 'Possui testes automatizados', hasTests(fileList));

  const manifest = detectManifest(fileList);
  add('manifest', 'Possui manifesto de dependências (package.json, requirements.txt, ...)', !!manifest, manifest || undefined);

  add('ci', 'Possui pipeline de CI (.github/workflows)', hasCi(fileList));

  let recent = false;
  if (pushedAt) {
    const days = (Date.now() - new Date(pushedAt).getTime()) / (1000 * 60 * 60 * 24);
    recent = days <= 180;
  }
  add('recentActivity', 'Atividade recente (push nos últimos 180 dias)', recent, pushedAt || 'desconhecida');

  return {
    total,
    grade: gradeFor(total),
    breakdown,
    stack: detectStack(packageJsonContent),
  };
}
