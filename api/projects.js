// Exemplo 2: ler dados de um arquivo JSON e filtrar com parâmetros de URL.
// Responde em GET /api/projects e GET /api/projects?q=react

import projects from '../src/data/projects.json' with { type: 'json' };

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ erro: 'Método não permitido' });
  }

  const busca = String(req.query.q || '').trim().toLowerCase();

  let resultado = busca
    ? projects.filter((p) => JSON.stringify(p).toLowerCase().includes(busca))
    : projects;

  const limite = Number(req.query.limite);

  if (Number.isInteger(limite) && limite > 0) {
    resultado = resultado.slice(0, limite);
  }

  return res.status(200).json(resultado);
}
