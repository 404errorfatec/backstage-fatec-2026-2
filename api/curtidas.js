// Exemplo 3: escrita com validação e banco de dados.
// GET /api/curtidas -> total de curtidas por projeto
// GET /api/curtidas?projeto_id=abc -> total de um projeto
// POST /api/curtidas {projeto_id, autor} -> curtir
// DELETE /api/curtidas?projeto_id=abc&autor=Ana -> descurtir
import { sql } from './_lib/db.js';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const { projeto_id } = req.query;

      if (projeto_id) {
        const [linha] = await sql`
          SELECT COUNT(*)::int AS total
          FROM curtidas
          WHERE projeto_id = ${String(projeto_id)}`;

        return res.status(200).json({
          projeto_id,
          total: linha.total
        });
      }

      const linhas = await sql`
        SELECT projeto_id, COUNT(*)::int AS total
        FROM curtidas
        GROUP BY projeto_id
        ORDER BY total DESC
        LIMIT 5`;

      return res.status(200).json(linhas);
    }

    if (req.method === 'POST') {
      const { projeto_id, autor } = req.body ?? {};

      if (!projeto_id || !autor) {
        return res.status(400).json({
          erro: 'projeto_id e autor são obrigatórios'
        });
      }

      if (String(autor).length > 60) {
        return res.status(400).json({
          erro: 'autor deve ter no máximo 60 caracteres'
        });
      }

      const inseridas = await sql`
        INSERT INTO curtidas (projeto_id, autor)
        VALUES (${String(projeto_id)}, ${String(autor)})
        ON CONFLICT (projeto_id, autor) DO NOTHING
        RETURNING *`;

      if (inseridas.length === 0) {
        return res.status(200).json({
          mensagem: 'Este autor já curtiu o projeto'
        });
      }

      return res.status(201).json(inseridas[0]);
    }

    if (req.method === 'DELETE') {
      const { projeto_id, autor } = req.query;

      if (!projeto_id || !autor) {
        return res.status(400).json({
          erro: 'projeto_id e autor são obrigatórios'
        });
      }

      const removidas = await sql`
        DELETE FROM curtidas
        WHERE projeto_id = ${String(projeto_id)}
        AND autor = ${String(autor)}
        RETURNING id`;

      if (removidas.length === 0) {
        return res.status(404).json({
          erro: 'Curtida não encontrada'
        });
      }

      return res.status(200).json({
        mensagem: 'Curtida removida'
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