CREATE TABLE IF NOT EXISTS curtidas (
    id SERIAL PRIMARY KEY,
    projeto_id TEXT NOT NULL,
    autor TEXT NOT NULL,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (projeto_id, autor)
);

CREATE TABLE IF NOT EXISTS comentarios (
    id SERIAL PRIMARY KEY,
    projeto_id TEXT NOT NULL,
    autor TEXT NOT NULL,
    texto TEXT NOT NULL,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_comentarios_projeto
ON comentarios (projeto_id);