const searchInput = document.querySelector("#search-input");
const statusFilter = document.querySelector("#status-filter");
const refreshButton = document.querySelector("#refresh-button");
const logoutButton = document.querySelector("#logout-button");
const reportsTableBody = document.querySelector("#reports-table-body");
const tableFeedback = document.querySelector("#table-feedback");
const summaryTotalActive = document.querySelector("#summary-total-active");
const summaryTotalNaFila = document.querySelector("#summary-total-na-fila");
const summaryTotalAtendido = document.querySelector("#summary-total-atendido");
const summaryTotalDescartado = document.querySelector("#summary-total-descartado");
const photoDialog = document.querySelector("#photo-dialog");
const photoDialogImage = document.querySelector("#photo-dialog-image");
const closePhotoDialogButton = document.querySelector("#close-photo-dialog");

const statusLabels = {
  na_fila: "Na fila",
  atendido: "Atendido",
  descartado: "Descartado",
};

let isLoading = false;

function setFeedback(message, type = "") {
  tableFeedback.textContent = message;
  tableFeedback.classList.remove("is-error", "is-success");

  if (type) {
    tableFeedback.classList.add(type);
  }
}

function formatDate(dateValue) {
  if (!dateValue) {
    return "Sem data";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(dateValue));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderSummary(summary) {
  summaryTotalActive.textContent = String(summary.totalActive || 0);
  summaryTotalNaFila.textContent = String(summary.totalNaFila || 0);
  summaryTotalAtendido.textContent = String(summary.totalAtendido || 0);
  summaryTotalDescartado.textContent = String(summary.totalDescartado || 0);
}

function createStatusOptions(currentStatus) {
  return Object.entries(statusLabels)
    .map(([value, label]) => `
      <option value="${value}" ${value === currentStatus ? "selected" : ""}>${label}</option>
    `)
    .join("");
}

function renderReports(reports) {
  if (reports.length === 0) {
    reportsTableBody.innerHTML = `
      <tr>
        <td colspan="7" class="table-empty">Nenhum registro encontrado para os filtros atuais.</td>
      </tr>
    `;
    return;
  }

  reportsTableBody.innerHTML = reports
    .map((report) => `
      <tr>
        <td data-label="Foto">
          <button
            class="thumb-button"
            type="button"
            data-action="open-photo"
            data-photo-path="${escapeHtml(report.photoPath)}"
            data-photo-alt="Foto enviada no protocolo ${escapeHtml(report.protocolCode)}"
          >
            <img
              class="report-thumb"
              src="${escapeHtml(report.photoPath)}"
              alt="Miniatura do protocolo ${escapeHtml(report.protocolCode)}"
            >
          </button>
        </td>
        <td data-label="Protocolo" class="cell-protocol">${escapeHtml(report.protocolCode)}</td>
        <td data-label="Cidadao">${escapeHtml(report.reporterName)}</td>
        <td data-label="Localizacao">${escapeHtml(report.locationLabel || "Nao informado")}</td>
        <td data-label="Data" class="cell-date">${escapeHtml(formatDate(report.createdAt))}</td>
        <td data-label="Status">
          <select class="status-select" data-action="update-status" data-report-id="${report.id}">
            ${createStatusOptions(report.status)}
          </select>
          <p class="status-meta">Atualizado em ${escapeHtml(formatDate(report.statusUpdatedAt || report.updatedAt))}</p>
        </td>
        <td data-label="Acoes">
          <div class="table-actions">
            <button
              class="painel-button painel-button-secondary action-button"
              type="button"
              data-action="open-photo"
              data-photo-path="${escapeHtml(report.photoPath)}"
              data-photo-alt="Foto enviada no protocolo ${escapeHtml(report.protocolCode)}"
            >
              Abrir foto
            </button>
            <button
              class="painel-button painel-button-danger action-button"
              type="button"
              data-action="delete-report"
              data-report-id="${report.id}"
              data-protocol-code="${escapeHtml(report.protocolCode)}"
            >
              Excluir
            </button>
          </div>
        </td>
      </tr>
    `)
    .join("");
}

async function loadSummary() {
  const response = await fetch("/api/painel/summary", {
    credentials: "same-origin",
  });

  if (response.status === 401) {
    window.location.href = "/acesso";
    return null;
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Nao foi possivel carregar o resumo.");
  }

  renderSummary(data);
  return data;
}

async function loadReports() {
  if (isLoading) {
    return;
  }

  isLoading = true;
  refreshButton.disabled = true;
  setFeedback("Carregando registros...");

  const params = new URLSearchParams();
  const search = searchInput.value.trim();
  const status = statusFilter.value.trim();

  if (search) {
    params.set("search", search);
  }

  if (status) {
    params.set("status", status);
  }

  try {
    const [summaryResponse, reportsResponse] = await Promise.all([
      loadSummary(),
      fetch(`/api/painel/reports?${params.toString()}`, {
        credentials: "same-origin",
      }),
    ]);

    if (summaryResponse === null) {
      return;
    }

    if (reportsResponse.status === 401) {
      window.location.href = "/acesso";
      return;
    }

    const data = await reportsResponse.json();

    if (!reportsResponse.ok) {
      setFeedback(data.message || "Nao foi possivel carregar os registros.", "is-error");
      return;
    }

    renderReports(data.reports || []);
    setFeedback("Painel atualizado.", "is-success");
  } catch (error) {
    setFeedback(error.message || "Falha de conexao ao carregar o painel.", "is-error");
  } finally {
    isLoading = false;
    refreshButton.disabled = false;
  }
}

async function updateStatus(reportId, status, selectElement) {
  selectElement.disabled = true;
  setFeedback("Atualizando status...");

  try {
    const response = await fetch(`/api/painel/reports/${reportId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "same-origin",
      body: JSON.stringify({ status }),
    });

    if (response.status === 401) {
      window.location.href = "/acesso";
      return;
    }

    const data = await response.json();

    if (!response.ok) {
      setFeedback(data.message || "Nao foi possivel atualizar o status.", "is-error");
      return;
    }

    setFeedback("Status atualizado.", "is-success");
    await loadReports();
  } catch (_error) {
    setFeedback("Falha de conexao ao atualizar o status.", "is-error");
  } finally {
    selectElement.disabled = false;
  }
}

async function deleteReport(reportId, protocolCode) {
  const confirmed = window.confirm(`Excluir o chamado ${protocolCode}? Ele sairá da listagem principal.`);

  if (!confirmed) {
    return;
  }

  setFeedback("Excluindo chamado...");

  try {
    const response = await fetch(`/api/painel/reports/${reportId}`, {
      method: "DELETE",
      credentials: "same-origin",
    });

    if (response.status === 401) {
      window.location.href = "/acesso";
      return;
    }

    const data = await response.json();

    if (!response.ok) {
      setFeedback(data.message || "Nao foi possivel excluir o chamado.", "is-error");
      return;
    }

    setFeedback("Chamado excluido da listagem principal.", "is-success");
    await loadReports();
  } catch (_error) {
    setFeedback("Falha de conexao ao excluir o chamado.", "is-error");
  }
}

function openPhoto(photoPath, photoAlt) {
  photoDialogImage.src = photoPath;
  photoDialogImage.alt = photoAlt;
  photoDialog.showModal();
}

function closePhoto() {
  photoDialog.close();
  photoDialogImage.removeAttribute("src");
}

refreshButton.addEventListener("click", () => {
  loadReports();
});

searchInput.addEventListener("input", () => {
  loadReports();
});

statusFilter.addEventListener("change", () => {
  loadReports();
});

reportsTableBody.addEventListener("click", (event) => {
  const trigger = event.target.closest("[data-action]");

  if (!trigger) {
    return;
  }

  const action = trigger.dataset.action;

  if (action === "open-photo") {
    openPhoto(trigger.dataset.photoPath, trigger.dataset.photoAlt);
    return;
  }

  if (action === "delete-report") {
    deleteReport(trigger.dataset.reportId, trigger.dataset.protocolCode);
  }
});

reportsTableBody.addEventListener("change", (event) => {
  const selectElement = event.target.closest('[data-action="update-status"]');

  if (!selectElement) {
    return;
  }

  updateStatus(selectElement.dataset.reportId, selectElement.value, selectElement);
});

closePhotoDialogButton.addEventListener("click", () => {
  closePhoto();
});

photoDialog.addEventListener("click", (event) => {
  if (event.target === photoDialog) {
    closePhoto();
  }
});

logoutButton.addEventListener("click", async () => {
  logoutButton.disabled = true;

  try {
    await fetch("/api/session/logout", {
      method: "POST",
      credentials: "same-origin",
    });
  } finally {
    window.location.href = "/acesso";
  }
});

loadReports();
