
import { sql } from '../_lib/db.js';

export default async function handler(req, res) {
  try {
    if (req.method === 'POST') {
      const { projeto_id, nota } = req.body ?? {};

      if (!projeto_id || nota === undefined) {
        return res.status(400).json({
          erro: 'projeto_id e nota são obrigatórios',
        });
      }

      const notaNumero = Number(nota);

      if (
        !Number.isInteger(notaNumero) ||
        notaNumero < 1 ||
        notaNumero > 5
      ) {
        return res.status(400).json({
          erro: 'A nota deve ser um número inteiro entre 1 e 5',
        });
      }

      const inseridas = await sql`
        INSERT INTO avaliacoes (projeto_id, nota)
        VALUES (${String(projeto_id)}, ${notaNumero})
        RETURNING *`;

      return res.status(201).json(inseridas[0]);
    }

    res.setHeader('Allow', 'POST');

    return res.status(405).json({
      erro: 'Método não permitido',
    });
  } catch (erro) {
    console.error(erro);

    return res.status(500).json({
      erro: 'Erro interno do servidor',
    });
  }
}
