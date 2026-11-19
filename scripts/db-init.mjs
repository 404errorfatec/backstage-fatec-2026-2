// Cria as tabelas do banco a partir de db/schema.sql.
// Uso: npm run db:init (funciona com Neon e com o Postgres local do Docker).
import { readFile } from 'node:fs/promises';

if (!process.env.DATABASE_URL) {
  console.error(
    'DATABASE_URL não definida. Crie o arquivo .env.local (veja .env.example).'
  );
  process.exit(1);
}

const { sql } = await import('../api/_lib/db.js');
const arquivo = new URL('../db/schema.sql', import.meta.url);
const conteudo = await readFile(arquivo, 'utf8');

// Executamos um comando por vez, então separamos por ponto e vírgula.
const comandos = conteudo
  .split(';')
  .map((comando) => comando.trim())
  .filter(Boolean);

try {
  for (const comando of comandos) {
    await sql.query(comando);
    console.log('OK:', comando.split('\n')[0]);
  }
  console.log('Banco pronto.');
} catch (erro) {
  console.error('Falha ao inicializar o banco:', erro);
  process.exitCode = 1;
} finally {
  // Encerra o pool do Postgres local, se for o caso.
  await sql.close?.();
}
