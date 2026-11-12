// Exemplo 2: ler dados de um arquivo JSON e filtrar com parâmetros de URL.
// Responde em GET /api/projects e GET /api/projects?q=react
import projects from '../src/data/projects.json' with { type: 'json' };

export default function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ erro: 'Método não permitido' });
    }

    const busca = String(req.query.q || '').trim().toLowerCase();

    const resultado = busca
        ? projects.filter((p) => JSON.stringify(p).toLowerCase().includes(busca))
        : projects;
        
    return res.status(200).json(resultado);
}