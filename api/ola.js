// Exemplo 1: o endpoint mais simples possível.
// Responde em GET /api/ola?nome=Maria

export default function handler(req, res) {
  if (req.method === "GET") {
    const nome = req.query.nome || "mundo";

    return res.status(200).json({
      mensagem: `Olá, ${nome}!`,
      metodo: req.method,
      hora: new Date().toISOString(),
    });
  }

  if (req.method === "POST") {
    const nome = req.body?.nome || "mundo";

    return res.status(200).json({
      mensagem: `Olá, ${nome}!`,
      metodo: req.method,
      hora: new Date().toISOString(),
    });
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({
    erro: "Método não permitido",
  });
}
