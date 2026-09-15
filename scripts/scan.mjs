import fs from 'fs/promises';
import path from 'path';

const MOCK_DIR = "mock-projects";

async function main() {
    const projectFolders = await fs.readdir(MOCK_DIR);

    for (const folder of projectFolders){
        const projectPath = path.join(MOCK_DIR, folder);
        const packagePath = path.join(projectPath, 'package.json');

        const packageRaw = await fs.readFile(packagePath, 'utf-8');
        const packageData = JSON.parse(packageRaw);

        console.log(`Lido: ${folder}`, packageData.name, packageData.description);
    }
}

main();