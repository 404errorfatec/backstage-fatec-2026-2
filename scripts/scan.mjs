import fs from 'node:fs/promises'
import path from 'node:path'

const projectsPath = path.join(process.cwd(), 'mock-projects')
const outputPath = path.join(
  process.cwd(),
  'src',
  'data',
  'project-analysis.json'
)

// Percorre uma pasta e todas as suas subpastas
async function getFiles(directory) {
  const entries = await fs.readdir(directory, {
    withFileTypes: true,
  })

  const files = []

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name)

    if (entry.isDirectory()) {
      const subFiles = await getFiles(entryPath)
      files.push(...subFiles)
    } else {
      files.push(entryPath)
    }
  }

  return files
}

// Procura um arquivo pelo nome
function getFileByName(files, fileName) {
  return files.find(
    file => path.basename(file) === fileName
  )
}

// Identifica tecnologias a partir dos nomes dos pacotes
function detectStack(dependencies) {
  const stack = []

  const packageNames = Object.keys(dependencies)

  if (
    packageNames.includes('react') ||
    packageNames.includes('react-dom')
  ) {
    stack.push('React')
  }

  if (packageNames.includes('vite')) {
    stack.push('Vite')
  }

  if (packageNames.includes('express')) {
    stack.push('Express')
  }

  if (packageNames.includes('next')) {
    stack.push('Next.js')
  }

  if (
    packageNames.includes('tailwindcss') ||
    packageNames.includes('@tailwindcss/vite')
  ) {
    stack.push('Tailwind CSS')
  }

  if (packageNames.includes('typescript')) {
    stack.push('TypeScript')
  }

  if (
    packageNames.includes('jest') ||
    packageNames.includes('@jest/globals')
  ) {
    stack.push('Jest')
  }

  if (packageNames.includes('vitest')) {
    stack.push('Vitest')
  }

  return stack
}

// Lê os projetos existentes dentro de mock-projects
const projects = await fs.readdir(projectsPath, {
  withFileTypes: true,
})

// Array que armazenará a análise de todos os projetos
const analysis = []

console.log('Análise dos projetos:')

// Analisa cada projeto
for (const project of projects) {
  if (!project.isDirectory()) {
    continue
  }

  const projectPath = path.join(
    projectsPath,
    project.name
  )

  // Busca todos os arquivos, incluindo subpastas
  const files = await getFiles(projectPath)

  // Procura arquivos importantes
  const readmePath = getFileByName(
    files,
    'README.md'
  )

  const gitignorePath = getFileByName(
    files,
    '.gitignore'
  )

  const packageJsonPath = getFileByName(
    files,
    'package.json'
  )

  const requirementsPath = getFileByName(
    files,
    'requirements.txt'
  )

  // Verifica a existência dos arquivos
  const hasReadme = Boolean(readmePath)
  const hasGitignore = Boolean(gitignorePath)
  const hasPackageJson = Boolean(packageJsonPath)
  const hasRequirements = Boolean(requirementsPath)

  // Procura arquivos relacionados a testes
  const hasTests = files.some(file => {
    const fileName = path
      .basename(file)
      .toLowerCase()

    return (
      fileName.includes('test') ||
      fileName.includes('spec')
    )
  })

  // Verifica se existem arquivos de dependências
  const hasDependencies =
    hasPackageJson || hasRequirements

  // Verifica se existe alguma estrutura analisável
  const hasStructure = files.length > 0

  // Calcula a nota
  let score = 0

  if (hasReadme) {
    score += 2
  }

  if (hasGitignore) {
    score += 2
  }

  if (hasTests) {
    score += 3
  }

  if (hasDependencies) {
    score += 1
  }

  if (hasStructure) {
    score += 2
  }

  // Lê o package.json, caso exista
  let packageJson = null

  if (packageJsonPath) {
    const packageContent = await fs.readFile(
      packageJsonPath,
      'utf-8'
    )

    if (packageContent.trim() !== '') {
      packageJson = JSON.parse(packageContent)
    }
  }

  // Junta dependencies e devDependencies
  const dependencies = {
    ...(packageJson?.dependencies || {}),
    ...(packageJson?.devDependencies || {}),
  }

  // Identifica a stack tecnológica
  const stack = detectStack(dependencies)

  // Cria a análise estruturada do projeto
  const projectAnalysis = {
    id: project.name,
    name: project.name,
    score,
    criteria: {
      readme: hasReadme,
      gitignore: hasGitignore,
      tests: hasTests,
      dependencies: hasDependencies,
      structure: hasStructure,
    },
    files: files.map(file =>
      path.relative(projectPath, file)
    ),
    stack,
    dependencies: Object.keys(dependencies),
  }

  // Adiciona a análise ao array geral
  analysis.push(projectAnalysis)

  // Mostra no terminal
  console.log(`\nProjeto: ${project.name}`)

  console.log(
    `README: ${hasReadme ? 'Sim' : 'Não'}`
  )

  console.log(
    `Gitignore: ${hasGitignore ? 'Sim' : 'Não'}`
  )

  console.log(
    `package.json: ${hasPackageJson ? 'Sim' : 'Não'}`
  )

  console.log(
    `requirements.txt: ${hasRequirements ? 'Sim' : 'Não'}`
  )

  console.log(
    `Testes identificados: ${hasTests ? 'Sim' : 'Não'}`
  )

  console.log(
    `Dependências identificadas: ${
      hasDependencies ? 'Sim' : 'Não'
    }`
  )

  console.log(
    `Estrutura analisável: ${
      hasStructure ? 'Sim' : 'Não'
    }`
  )

  console.log(`Nota final: ${score}/10`)

  console.log(
    `Stack: ${
      stack.length > 0
        ? stack.join(', ')
        : 'Não identificada'
    }`
  )

  console.log('Dependências:')

  for (const dependency of Object.keys(dependencies)) {
    console.log(`  - ${dependency}`)
  }
}

// Garante que a pasta de destino exista
await fs.mkdir(
  path.dirname(outputPath),
  { recursive: true }
)

// Gera o arquivo JSON
await fs.writeFile(
  outputPath,
  JSON.stringify(analysis, null, 2),
  'utf-8'
)

console.log(
  `\nJSON gerado com sucesso em: ${outputPath}`
)