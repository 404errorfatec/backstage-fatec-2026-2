// Exemplo 4: autorização simples com chave de administrador.
// GET /api/comentarios?projeto_id=abc -> lista comentários
// POST /api/comentarios {projeto_id, autor, texto} -> comenta
// DELETE /api/comentarios?id=7 (header x-admin-key) -> remove (só com chave)
import { sql } from './_lib/db.js';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const { projeto_id } = req.query;

      if (!projeto_id) {
        return res.status(400).json({
          erro: 'projeto_id é obrigatório'
        });
      }

      const linhas = await sql`
        SELECT *
        FROM comentarios
        WHERE projeto_id = ${String(projeto_id)}
        ORDER BY criado_em DESC`;

      return res.status(200).json(linhas);
    }

    if (req.method === 'POST') {
      const { projeto_id, autor, texto } = req.body ?? {};

      if (!projeto_id || !autor || !texto) {
        return res.status(400).json({
          erro: 'projeto_id, autor e texto são obrigatórios'
        });
      }

      if (String(autor).length > 60) {
        return res.status(400).json({
          erro: 'autor deve ter no máximo 60 caracteres'
        });
      }

      if (String(texto).length > 500) {
        return res.status(400).json({
          erro: 'texto deve ter no máximo 500 caracteres'
        });
      }

      const inseridos = await sql`
        INSERT INTO comentarios (projeto_id, autor, texto)
        VALUES (
          ${String(projeto_id)},
          ${String(autor)},
          ${String(texto)}
        )
        RETURNING *`;

      return res.status(201).json(inseridos[0]);
    }

    if (req.method === 'DELETE') {
      const chave = req.headers['x-admin-key'];

      if (!process.env.ADMIN_KEY || chave !== process.env.ADMIN_KEY) {
        return res.status(401).json({
          erro: 'Não autorizado'
        });
      }

      const { id } = req.query;
      const comentarioId = Number(id);

      if (!Number.isInteger(comentarioId) || comentarioId <= 0) {
        return res.status(400).json({
          erro: 'ID inválido'
        });
      }

      const removidos = await sql`
        DELETE FROM comentarios
        WHERE id = ${comentarioId}
        RETURNING id`;

      if (removidos.length === 0) {
        return res.status(404).json({
          erro: 'Comentário não encontrado'
        });
      }

      return res.status(200).json({
        mensagem: 'Comentário removido'
      });
    }

    res.setHeader('Allow', 'GET, POST, DELETE');

    return res.status(405).json({
      erro: 'Método não permitido'
    });

  } catch (erro) {
    console.error(erro);

    return res.status(500).json({
      erro: 'Erro interno do servidor'
    });
  }
}