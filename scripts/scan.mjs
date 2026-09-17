import fs from 'fs/promises';
import path from 'path';

const MOCK_DIR = "mock-projects";
const projects = []

async function main() {
    const projectFolders = await fs.readdir(MOCK_DIR);

    for (const folder of projectFolders){
        const projectPath = path.join(MOCK_DIR, folder);
        const packagePath = path.join(projectPath, 'package.json');
        const requirementsPath = path.join(projectPath, 'requirements.txt');

        const hasPackageJson = await fileExists(packagePath);
        const hasRequirements = await fileExists(requirementsPath);

        let packageData = {};
        let tags = [];

        if (hasPackageJson){
            try {
                const packageRaw = await fs.readFile(packagePath, 'utf-8');
                packageData = JSON.parse(packageRaw);
                tags = Object.keys(packageData.dependencies || {});
            } catch (err) {
                console.warn(`Pulando "${folder}": Erro ao ler/parsear package.json (${err.message}) `);
                continue;
            }
        } else if(hasRequirements) {
            try{
                tags = await parseRequirementsTxt(requirementsPath);
                //sem package.json, procura metadados em outro lugar
                packageData = await readProjectMeta(projectPath);
            }catch (err) {
                console.warn(`Pulando "${folder}": Erro ao ler requirements.txt (${err.message}) `);
                continue;
            }
        } else {
            console.warn(`Pulando "${folder}": nanhum package.json ou requirements.txt encontrado`);
                continue;
        }
       
        //Verificadores
        const hasReadme = await fileExists(path.join(projectPath, 'README.md'));
        const hasGitignore = await fileExists(path.join(projectPath, '.gitignore'));
        const hasTests = await fileExists(path.join(projectPath,'tests')) ||
            await fileExists(path.join(projectPath, '__tests__'));

        const score = calculateScore({ hasReadme, hasGitignore, hasTests});

        console.log(`***\nLido: ${folder}`, 
            `\nNome:`, packageData.name, 
            `\nDescrição:`, packageData.description, 
            `\nDependências:`, tags, 
            `\nArquivos:`,
                { hasReadme: hasReadme ? 'Possui' : 'Não Possui',
                    hasGitignore: hasGitignore ? 'Possui' : 'Não Possui', 
                    hasTests: hasTests ? 'Possui' : 'Não Possui' }, 
             `\nNota:`, score);

        projects.push({
            id: folder,
            title: packageData.name,
            description: packageData.description,
            tags: tags,
            score: score,
            professor: packageData.professor || "Não informado",
            image: packageData.image || "https://via.placeholder.com/400x300",
            githubUrl: packageData.repository?.url || "#"
        });
    }

    console.log('\n***Relatório de Repositórios***');
    console.log(projects);

    //Gravando arquivo em scr/data/projects.json
    const outputPath = path.join('src', 'data', 'projects.json');
    await fs.writeFile(outputPath, JSON.stringify(projects, null, 2));
}

async function parseRequirementsTxt(filePath){
    const raw = await fs.readFile(filePath, 'utf-8');
    return raw
        .split ('\n')
        .map (line => line.trim())
        .filter (line => line && !line.startsWith('#')) //ignora vazias e comentários
        .map(line => line.split(/[=<>~!]/)[0].trim()) //remove versão
        .filter(Boolean);
}

async function readProjectMeta(projectPath){
   //Fallback: procura um arquivo tipo project.json com nome/descrição/professor
   //requirements.txt não possui estes metodos
   const metaPath = path.join(projectPath, 'project.json');
   if(await fileExists(metaPath)){
    const raw = await fs.readFile(metaPath, 'utf-8');
    return JSON.parse(raw);
   }
   return {};
}



async function fileExists(filePath){
    try {
        await fs.access(filePath);
        return true
    } catch {
        return false;
    }
}

function calculateScore ({hasReadme, hasGitignore, hasTests}){
    let score = 0;
    if (hasReadme) score +=50;
    if (hasGitignore) score += 30;
    if (hasTests) score += 20;
    return score;
}

main();