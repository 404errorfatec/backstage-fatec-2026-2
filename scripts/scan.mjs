import fs from 'node:fs/promises';
import path from 'node:path';

const MOCK_DIR = './mock-projects';
const OUTPUT_FILE = './src/data/projects.json';

// Banco de imagens de capa para sorteio (tecnologia, código, dados)
const COVER_IMAGES = [
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=400",
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=400",
  "https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&q=80&w=400",
  "https://images.unsplash.com/photo-1587620962725-abab7fe55159?auto=format&fit=crop&q=80&w=400",
  "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?auto=format&fit=crop&q=80&w=400",
  "https://images.unsplash.com/photo-1537432376769-00f5c2f4c8d2?auto=format&fit=crop&q=80&w=400",
  "https://images.unsplash.com/photo-1516116216624-53e697fedbea?auto=format&fit=crop&q=80&w=400"
];

async function scanProjects() {
  try {
    console.log('🔍 Iniciando inspeção de repositórios multiplataforma...');
    
    const dirents = await fs.readdir(MOCK_DIR, { withFileTypes: true });
    const projects = [];
    let idCounter = 1;

    for (const dirent of dirents) {
      if (!dirent.isDirectory()) continue;

      const projectName = dirent.name;
      const projectPath = path.join(MOCK_DIR, projectName);
      
      const readmePath = path.join(projectPath, 'README.md');
      const gitignorePath = path.join(projectPath, '.gitignore');

      let tags = [];
      let title = projectName;
      let description = "Descrição não fornecida.";
      let hasTests = false;
      let score = 0;
      let detectedType = null;

      // 1. Detecção: Java Spring Boot (Maven)
      if (await fileExists(path.join(projectPath, 'pom.xml'))) {
        detectedType = 'Java/Maven';
        score += 25;
        
        const pomContent = await fs.readFile(path.join(projectPath, 'pom.xml'), 'utf-8');
        const artifactMatches = [...pomContent.matchAll(/<artifactId>(.*?)<\/artifactId>/g)];
        tags = artifactMatches.map(m => m[1]).filter(tag => !tag.includes('plugin')); 
        hasTests = await fileExists(path.join(projectPath, 'src', 'test'));
      }
      
      // 2. Detecção: Python (requirements.txt)
      else if (await fileExists(path.join(projectPath, 'requirements.txt'))) {
        detectedType = 'Python';
        score += 25;
        
        const reqContent = await fs.readFile(path.join(projectPath, 'requirements.txt'), 'utf-8');
        tags = reqContent.split('\n')
                 .map(line => line.trim())
                 .filter(line => line.length > 0 && !line.startsWith('#'))
                 .map(line => line.split('==')[0].split('>')[0]); 
                 
        hasTests = await fileExists(path.join(projectPath, 'tests'));
      }
      
      // 3. Detecção: Node.js / JavaScript / React (package.json)
      else if (await fileExists(path.join(projectPath, 'package.json'))) {
        detectedType = 'Node.js';
        score += 25;
        
        const fileContent = await fs.readFile(path.join(projectPath, 'package.json'), 'utf-8');
        const packageData = JSON.parse(fileContent);
        
        title = packageData.name || projectName;
        description = packageData.description || description;
        
        if (packageData.dependencies) tags.push(...Object.keys(packageData.dependencies));
        if (packageData.devDependencies) tags.push(...Object.keys(packageData.devDependencies));
        
        const testScript = packageData.scripts?.test;
        hasTests = !!testScript && !testScript.includes("no test specified");
      }

      if (!detectedType) {
        console.warn(`⚠️  Ignorando '${projectName}': Nenhum arquivo de manifesto encontrado.`);
        continue;
      }

      // 4. Validação de conformidade geral
      const hasReadme = await fileExists(readmePath);
      const hasGitignore = await fileExists(gitignorePath);
      
      if (hasReadme) score += 25;
      if (hasGitignore) score += 25;
      if (hasTests) score += 25;

      const uniqueTags = [...new Set(tags)];
      const formattedTags = uniqueTags
        .map(tag => tag.charAt(0).toUpperCase() + tag.slice(1))
        .slice(0, 4);
      formattedTags.unshift(detectedType);

      // Sorteia uma imagem aleatória do array para este projeto
      const randomImageIndex = Math.floor(Math.random() * COVER_IMAGES.length);
      const selectedImage = COVER_IMAGES[randomImageIndex];

      // 5. Montagem do Objeto
      const projectObj = {
        id: String(idCounter++),
        title: title,
        description: description,
        professor: "Orientador a definir",
        tags: formattedTags.slice(0, 4),
        image: selectedImage, // Usa a imagem sorteada aqui
        githubUrl: "#",
        metrics: {
          score: score,
          conformity: {
            readme: hasReadme,
            gitignore: hasGitignore,
            tests: hasTests
          }
        }
      };

      projects.push(projectObj);
    }

    await fs.writeFile(OUTPUT_FILE, JSON.stringify(projects, null, 2), 'utf-8');
    
    console.log(`✅ Scan concluído! ${projects.length} projeto(s) processado(s) com imagens dinâmicas.`);

  } catch (err) {
    console.error('❌ Erro na execução do scan:', err);
  }
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

scanProjects();