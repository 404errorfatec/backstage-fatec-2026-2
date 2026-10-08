const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const express = require("express");
const multer = require("multer");
const Database = require("better-sqlite3");
require("dotenv").config();

const app = express();
const port = Number(process.env.PORT || 4173);
const databasePath = process.env.DATABASE_PATH || path.join(__dirname, "data", "cidade_sem_buracos.sqlite3");
const panelUsername = process.env.PAINEL_USERNAME;
const panelPassword = process.env.PAINEL_PASSWORD;
let databaseReady = false;

const uploadDir = path.join(__dirname, "uploads");
const publicDir = path.join(__dirname, "public");
const panelDir = path.join(__dirname, "painel");
const schemaPath = path.join(__dirname, "sql", "schema.sql");
const sessionCookieName = "cidade_sem_buracos_session";
const sessionTtlMs = 1000 * 60 * 60 * 12;
const activeSessions = new Map();
const allowedReportStatuses = new Set(["na_fila", "atendido", "descartado"]);

fs.mkdirSync(uploadDir, { recursive: true });
fs.mkdirSync(path.dirname(databasePath), { recursive: true });

const db = new Database(databasePath);
db.pragma("journal_mode = WAL");

const storage = multer.diskStorage({
  destination: (_request, _file, callback) => {
    callback(null, uploadDir);
  },
  filename: (_request, file, callback) => {
    const extension = path.extname(file.originalname || "").toLowerCase() || ".jpg";
    callback(null, `${Date.now()}-${crypto.randomUUID()}${extension}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 8 * 1024 * 1024,
  },
  fileFilter: (_request, file, callback) => {
    if (!file.mimetype.startsWith("image/")) {
      callback(new Error("Envie apenas arquivos de imagem."));
      return;
    }

    callback(null, true);
  },
});

function createProtocolCode() {
  return `CSB-${new Date().getFullYear()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
}

function parseCookies(cookieHeader = "") {
  return cookieHeader
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((cookies, part) => {
      const separatorIndex = part.indexOf("=");

      if (separatorIndex === -1) {
        return cookies;
      }

      const key = part.slice(0, separatorIndex).trim();
      const value = decodeURIComponent(part.slice(separatorIndex + 1).trim());
      cookies[key] = value;
      return cookies;
    }, {});
}

function getSessionToken(request) {
  const cookies = parseCookies(request.headers.cookie);
  return cookies[sessionCookieName] || "";
}

function cleanupExpiredSessions() {
  const now = Date.now();

  for (const [token, session] of activeSessions.entries()) {
    if (session.expiresAt <= now) {
      activeSessions.delete(token);
    }
  }
}

function createSession() {
  cleanupExpiredSessions();

  const token = crypto.randomBytes(24).toString("hex");
  activeSessions.set(token, {
    createdAt: Date.now(),
    expiresAt: Date.now() + sessionTtlMs,
  });

  return token;
}

function destroySession(token) {
  if (!token) {
    return;
  }

  activeSessions.delete(token);
}

function serializeSessionCookie(token, maxAgeMs = sessionTtlMs) {
  const parts = [
    `${sessionCookieName}=${encodeURIComponent(token)}`,
    "HttpOnly",
    "Path=/",
    "SameSite=Lax",
    `Max-Age=${Math.floor(maxAgeMs / 1000)}`,
  ];

  return parts.join("; ");
}

function clearSessionCookie() {
  return `${sessionCookieName}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`;
}

function hasValidPanelCredentials() {
  return Boolean(panelUsername && panelPassword);
}

function timingSafeEqualText(left, right) {
  const leftBuffer = Buffer.from(left || "");
  const rightBuffer = Buffer.from(right || "");

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function isAuthenticated(request) {
  cleanupExpiredSessions();

  const token = getSessionToken(request);

  if (!token) {
    return false;
  }

  const session = activeSessions.get(token);

  if (!session) {
    return false;
  }

  if (session.expiresAt <= Date.now()) {
    activeSessions.delete(token);
    return false;
  }

  session.expiresAt = Date.now() + sessionTtlMs;
  return true;
}

function requirePanelAuth(request, response, next) {
  if (!hasValidPanelCredentials()) {
    response.status(503).json({
      message: "Credenciais do painel nao configuradas no servidor.",
    });
    return;
  }

  if (!isAuthenticated(request)) {
    response.status(401).json({
      message: "Sessao invalida ou expirada.",
    });
    return;
  }

  next();
}

function formatLocation(row) {
  if (row.location_source === "gps" && row.latitude !== null && row.longitude !== null) {
    return `${Number(row.latitude).toFixed(5)}, ${Number(row.longitude).toFixed(5)}`;
  }

  const parts = [
    row.manual_street,
    row.manual_number,
    row.manual_district,
    row.manual_city,
  ].filter(Boolean);

  return parts.join(" - ");
}

function ensureReportColumns() {
  const columns = new Set(db.prepare("PRAGMA table_info(reports)").all().map((column) => column.name));

  if (!columns.has("status_updated_at")) {
    db.exec(`
      ALTER TABLE reports
      ADD COLUMN status_updated_at TEXT NOT NULL DEFAULT (STRFTIME('%Y-%m-%dT%H:%M:%fZ', 'now'))
    `);
  }

  if (!columns.has("deleted_at")) {
    db.exec(`
      ALTER TABLE reports
      ADD COLUMN deleted_at TEXT
    `);
  }

  db.prepare(`
    UPDATE reports
    SET
      status = 'na_fila',
      status_updated_at = COALESCE(status_updated_at, updated_at, created_at, STRFTIME('%Y-%m-%dT%H:%M:%fZ', 'now'))
    WHERE status = 'submitted'
  `).run();
}

async function ensureDatabase() {
  const schemaSql = fs.readFileSync(schemaPath, "utf8");
  db.exec(schemaSql);
  ensureReportColumns();
  databaseReady = true;
}

app.use(express.json());
app.use(express.static(publicDir));

app.get("/api/health", async (_request, response) => {
  if (!databaseReady) {
    response.status(503).json({
      ok: false,
      database: "disconnected",
      message: "Banco de dados SQLite indisponivel.",
    });
    return;
  }

  try {
    db.prepare("SELECT 1").get();
    response.json({ ok: true, database: "connected" });
  } catch (error) {
    response.status(500).json({
      ok: false,
      database: "disconnected",
      message: error.message,
    });
  }
});

app.post("/api/session/login", (request, response) => {
  if (!hasValidPanelCredentials()) {
    response.status(503).json({
      message: "Credenciais do painel nao configuradas no servidor.",
    });
    return;
  }

  const username = request.body?.username?.trim() || "";
  const password = request.body?.password || "";

  if (!timingSafeEqualText(username, panelUsername) || !timingSafeEqualText(password, panelPassword)) {
    response.status(401).json({
      message: "Credenciais invalidas.",
    });
    return;
  }

  const token = createSession();
  response.setHeader("Set-Cookie", serializeSessionCookie(token));
  response.json({ ok: true });
});

app.post("/api/session/logout", (request, response) => {
  destroySession(getSessionToken(request));
  response.setHeader("Set-Cookie", clearSessionCookie());
  response.json({ ok: true });
});

app.get("/api/session", (request, response) => {
  if (!hasValidPanelCredentials()) {
    response.status(503).json({
      ok: false,
      message: "Credenciais do painel nao configuradas no servidor.",
    });
    return;
  }

  response.json({ ok: isAuthenticated(request) });
});

app.post("/api/reports", upload.single("photo"), async (request, response) => {
  if (!databaseReady) {
    response.status(503).json({
      message: "O banco de dados ainda nao esta pronto. Tente novamente em instantes.",
    });
    return;
  }

  if (!request.file) {
    response.status(400).json({ message: "Adicione uma foto para continuar." });
    return;
  }

  const {
    reporterName,
    latitude,
    longitude,
    manualStreet,
    manualNumber,
    manualDistrict,
    manualCity,
    locationSource,
  } = request.body;

  const hasGps = latitude && longitude;
  const hasManualAddress = manualStreet && manualNumber && manualDistrict && manualCity;

  if (!reporterName?.trim()) {
    response.status(400).json({ message: "Preencha seu nome." });
    return;
  }

  if (!hasGps && !hasManualAddress) {
    response.status(400).json({ message: "Informe sua localizacao ou endereco." });
    return;
  }

  const protocolCode = createProtocolCode();

  try {
    const row = db
      .prepare(
        `
        INSERT INTO reports (
          protocol_code,
          reporter_name,
          photo_path,
          photo_original_name,
          latitude,
          longitude,
          manual_street,
          manual_number,
          manual_district,
          manual_city,
          location_source,
          status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'na_fila')
        RETURNING id, protocol_code, status, created_at
      `,
      )
      .get(
        protocolCode,
        reporterName.trim(),
        `/uploads/${request.file.filename}`,
        request.file.originalname,
        hasGps ? Number(latitude) : null,
        hasGps ? Number(longitude) : null,
        manualStreet?.trim() || null,
        manualNumber?.trim() || null,
        manualDistrict?.trim() || null,
        manualCity?.trim() || null,
        locationSource === "manual" ? "manual" : "gps",
      );

    response.status(201).json({
      message: "Obrigado por contribuir! Sua solicitacao foi enviada para a prefeitura.",
      report: row,
    });
  } catch (error) {
    console.error("Erro ao salvar solicitacao:", error);
    response.status(500).json({
      message: "Nao foi possivel enviar agora. Tente novamente em instantes.",
    });
  }
});

app.get("/api/painel/reports", requirePanelAuth, async (request, response) => {
  if (!databaseReady) {
    response.status(503).json({
      message: "Banco de dados indisponivel.",
    });
    return;
  }

  const search = request.query.search?.trim() || "";
  const status = request.query.status?.trim() || "";
  const values = [];
  const conditions = [];

  if (search) {
    values.push(`%${search}%`, `%${search}%`);
    conditions.push("(protocol_code LIKE ? OR reporter_name LIKE ?)");
  }

  if (status) {
    if (!allowedReportStatuses.has(status)) {
      response.status(400).json({
        message: "Status informado e invalido.",
      });
      return;
    }

    values.push(status);
    conditions.push("status = ?");
  }

  conditions.push("deleted_at IS NULL");

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  try {
    const rows = db
      .prepare(
        `
        SELECT
          id,
          protocol_code,
          reporter_name,
          photo_path,
          photo_original_name,
          latitude,
          longitude,
          manual_street,
          manual_number,
          manual_district,
          manual_city,
          location_source,
          status,
          created_at,
          updated_at,
          status_updated_at
        FROM reports
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT 200
      `,
      )
      .all(...values);

    response.json({
      reports: rows.map((row) => ({
        id: row.id,
        protocolCode: row.protocol_code,
        reporterName: row.reporter_name,
        photoPath: row.photo_path,
        photoOriginalName: row.photo_original_name,
        locationSource: row.location_source,
        locationLabel: formatLocation(row),
        status: row.status === "submitted" ? "na_fila" : row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        statusUpdatedAt: row.status_updated_at,
      })),
    });
  } catch (error) {
    console.error("Erro ao listar registros do painel:", error);
    response.status(500).json({
      message: "Nao foi possivel carregar os registros agora.",
    });
  }
});

app.get("/api/painel/summary", requirePanelAuth, async (_request, response) => {
  if (!databaseReady) {
    response.status(503).json({
      message: "Banco de dados indisponivel.",
    });
    return;
  }

  try {
    const row = db
      .prepare(
        `
      SELECT
        SUM(CASE WHEN deleted_at IS NULL THEN 1 ELSE 0 END) AS total_active,
        SUM(CASE WHEN deleted_at IS NULL AND status IN ('na_fila', 'submitted') THEN 1 ELSE 0 END) AS total_na_fila,
        SUM(CASE WHEN deleted_at IS NULL AND status = 'atendido' THEN 1 ELSE 0 END) AS total_atendido,
        SUM(CASE WHEN deleted_at IS NULL AND status = 'descartado' THEN 1 ELSE 0 END) AS total_descartado,
        MAX(CASE WHEN deleted_at IS NULL THEN created_at END) AS latest_created_at
      FROM reports
    `,
      )
      .get() || {};
    response.json({
      totalActive: Number(row.total_active || 0),
      totalNaFila: Number(row.total_na_fila || 0),
      totalAtendido: Number(row.total_atendido || 0),
      totalDescartado: Number(row.total_descartado || 0),
      latestCreatedAt: row.latest_created_at,
    });
  } catch (error) {
    console.error("Erro ao carregar resumo do painel:", error);
    response.status(500).json({
      message: "Nao foi possivel carregar o resumo agora.",
    });
  }
});

app.patch("/api/painel/reports/:id/status", requirePanelAuth, async (request, response) => {
  if (!databaseReady) {
    response.status(503).json({
      message: "Banco de dados indisponivel.",
    });
    return;
  }

  const reportId = Number(request.params.id);
  const nextStatus = request.body?.status?.trim();

  if (!Number.isInteger(reportId) || reportId <= 0) {
    response.status(400).json({
      message: "Chamado invalido.",
    });
    return;
  }

  if (!allowedReportStatuses.has(nextStatus)) {
    response.status(400).json({
      message: "Status invalido.",
    });
    return;
  }

  try {
    const row = db
      .prepare(
        `
        UPDATE reports
        SET
          status = ?,
          status_updated_at = STRFTIME('%Y-%m-%dT%H:%M:%fZ', 'now'),
          updated_at = STRFTIME('%Y-%m-%dT%H:%M:%fZ', 'now')
        WHERE id = ?
          AND deleted_at IS NULL
        RETURNING id, status, status_updated_at
      `,
      )
      .get(nextStatus, reportId);

    if (!row) {
      response.status(404).json({
        message: "Chamado nao encontrado.",
      });
      return;
    }

    response.json({
      report: {
        id: row.id,
        status: row.status,
        statusUpdatedAt: row.status_updated_at,
      },
    });
  } catch (error) {
    console.error("Erro ao atualizar status:", error);
    response.status(500).json({
      message: "Nao foi possivel atualizar o status agora.",
    });
  }
});

app.delete("/api/painel/reports/:id", requirePanelAuth, async (request, response) => {
  if (!databaseReady) {
    response.status(503).json({
      message: "Banco de dados indisponivel.",
    });
    return;
  }

  const reportId = Number(request.params.id);

  if (!Number.isInteger(reportId) || reportId <= 0) {
    response.status(400).json({
      message: "Chamado invalido.",
    });
    return;
  }

  try {
    const row = db
      .prepare(
        `
        UPDATE reports
        SET
          deleted_at = STRFTIME('%Y-%m-%dT%H:%M:%fZ', 'now'),
          updated_at = STRFTIME('%Y-%m-%dT%H:%M:%fZ', 'now')
        WHERE id = ?
          AND deleted_at IS NULL
        RETURNING id
      `,
      )
      .get(reportId);

    if (!row) {
      response.status(404).json({
        message: "Chamado nao encontrado.",
      });
      return;
    }

    response.json({ ok: true });
  } catch (error) {
    console.error("Erro ao excluir chamado:", error);
    response.status(500).json({
      message: "Nao foi possivel excluir o chamado agora.",
    });
  }
});

app.get("/acesso", (_request, response) => {
  response.sendFile(path.join(panelDir, "acesso.html"));
});

app.get("/painel", (request, response) => {
  if (!hasValidPanelCredentials()) {
    response.status(503).send("Credenciais do painel nao configuradas no servidor.");
    return;
  }

  if (!isAuthenticated(request)) {
    response.redirect("/acesso");
    return;
  }

  response.sendFile(path.join(panelDir, "index.html"));
});

app.get("/painel-assets/:fileName", (request, response) => {
  const fileName = request.params.fileName;

  if (!/^[a-z0-9_-]+\.(css|js)$/i.test(fileName)) {
    response.status(404).end();
    return;
  }

  response.sendFile(path.join(panelDir, fileName));
});

app.use("/uploads", requirePanelAuth, express.static(uploadDir));

app.get(/.*/, (_request, response) => {
  response.sendFile(path.join(publicDir, "index.html"));
});

async function start() {
  try {
    await ensureDatabase();
    app.listen(port, () => {
      const dbLabel = databaseReady ? "SQLite conectado" : "SQLite pendente";
      console.log(`Cidade Sem Buracos em http://localhost:${port} (${dbLabel})`);
    });
  } catch (error) {
    console.error("Falha ao preparar o banco:", error.message);
    process.exit(1);
  }
}

start();
