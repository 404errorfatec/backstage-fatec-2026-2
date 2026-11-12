// Exemplo 1: o endpoint mais simples possível.
// Responde em GET /api/ola?nome=Maria
export default function handler(req, res) {
    const nome = req.query.nome || 'mundo';

    res.status(200).json({
        mensagem: `Olá, ${nome}!`,
        metodo: req.method,
        hora: new Date().toISOString(),
    });
}
