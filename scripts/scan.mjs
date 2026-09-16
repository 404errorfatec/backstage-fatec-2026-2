import fs from 'fs/promises';
import path from 'path';

const MOCK_DIR = "mock-projects";
const projects = []

async function main() {
    const projectFolders = await fs.readdir(MOCK_DIR);

    for (const folder of projectFolders){
        const projectPath = path.join(MOCK_DIR, folder);
        const packagePath = path.join(projectPath, 'package.json');

        const packageRaw = await fs.readFile(packagePath, 'utf-8');
        const packageData = JSON.parse(packageRaw);

        const tags = Object.keys(packageData.dependencies || {})

        //Verificadores
        const hasReadme = await fileExists(path.join(projectPath, 'README.md'));
        const hasGitignore = await fileExists(path.join(projectPath, '.gitignore'));
        const hasTests = await fileExists(path.join(projectPath,'tests')) ||
        await fileExists(path.join(projectPath, '__tests__'));

        const score = calculateScore({ hasReadme, hasGitignore, hasTests});

        console.log(`***\nLido: ${folder}`, `\nNome:`, packageData.name, `\nDescrição:`, packageData.description, `\nDependências:`, tags, `\nArquivos:`, { hasReadme: hasReadme ? 'Possui' : 'Não Possui', hasGitignore: hasGitignore ? 'Possui' : 'Não Possui', hasTests: hasTests ? 'Possui' : 'Não Possui' }, `\nNota:`, score);

        projects.push({
            id: folder,
            title: packageData.name,
            description: packageData.description,
            tags: tags,
            score: score,
            githubUrl: "#"
        });
    }

    console.log('\n***Relatório de Repositórios***');
    console.log(projects);

    //Gravando arquivo em scr/data/projects.json
    const outputPath = path.join('src', 'data', 'projects.json');
    await fs.writeFile(outputPath, JSON.stringify(projects, null, 2));
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