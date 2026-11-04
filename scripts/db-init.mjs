// Cria as tabelas do banco a partir de db/schema.sql.
// Uso: npm run db:init
import { readFile } from 'node:fs/promises';
import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL não definida. Crie o arquivo .env.local (veja .env.example).');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const arquivo = new URL('../db/schema.sql', import.meta.url);
const conteudo = await readFile(arquivo, 'utf8');

// O driver HTTP executa um comando por vez, então separamos por ponto e vírgula.
const comandos = conteudo
  .split(';')
  .map((c) => c.trim())
  .filter(Boolean);

for (const comando of comandos) {
  await sql.query(comando);
  console.log('OK:', comando.split('\n')[0]);
}

console.log('Banco pronto.');
