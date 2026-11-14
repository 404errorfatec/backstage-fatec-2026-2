import { neon } from '@neondatabase/serverless';
import pg from 'pg';

// A string de conexão vem de variável de ambiente, nunca do código.
// Localmente: arquivo .env.local. Na Vercel: painel do projeto.

const url = process.env.DATABASE_URL;

if (!url) {
    throw new Error('DATABASE_URL não definida. Veja o arquivo .env.example.');
}
// Banco hospedado no Neon usa o driver HTTP serverless.
// Qualquer outro endereço (localhost, Docker...) usa o driver "pg" comum.
const usaNeon = new URL(url).hostname.endsWith('.neon.tech');

function criarSqlLocal(connectionString) {
    const pool = new pg.Pool({ connectionString });

 // Aceita o mesmo formato dos endpoints: sql`SELECT ... ${valor}`
 // Cada ${valor} vira um parâmetro ($1, $2...) enviado separado do comando.
 const sql = async (partes, ...valores) => {
    const texto = partes.reduce(
        (acumulado, parte, i) => acumulado + parte + (i < valores.length ? `$${i + 1}` 
: ''),
      ''
    );

    const { rows } = await pool.query(texto, valores);
    return rows;
 };

 // Aceita sql.query('comando', [parametros]), como o driver do Neon.
 sql.query = async (texto, parametros = []) => {
    const { rows } = await pool.query(texto, parametros);
    return rows;
 };
 
    return sql;
}

export const sql = usaNeon ? neon(url) : criarSqlLocal(url);
