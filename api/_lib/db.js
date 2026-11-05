import { neon } from '@neondatabase/serverless';

// A string de conexão vem de variável de ambiente.
if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL não definida. Veja o arquivo .env.example.'
  );
}

export const sql = neon(process.env.DATABASE_URL);