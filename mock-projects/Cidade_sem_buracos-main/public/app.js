const state = {
  currentStep: 1,
  photoFile: null,
  photoUrl: "",
  location: null,
  gpsStatus: "idle",
  activeLocationSource: null,
  submitting: false,
};

const form = document.querySelector("#report-form");
const photoInput = document.querySelector("#photo-input");
const cameraButton = document.querySelector("#camera-button");
const photoPreview = document.querySelector("#photo-preview");
const previewImage = document.querySelector("#preview-image");
const photoHint = document.querySelector("#photo-hint");
const stepOneContinue = document.querySelector("#step-one-continue");
const stepTwoBack = document.querySelector("#step-two-back");
const stepTwoContinue = document.querySelector("#step-two-continue");
const stepThreeBack = document.querySelector("#step-three-back");

const progressFill = document.querySelector("#progress-fill");
const stepPanels = Array.from(document.querySelectorAll("[data-step]"));
const stepIndicators = Array.from(document.querySelectorAll("[data-step-indicator]"));

const locationBadge = document.querySelector("#location-badge");
const locationStatus = document.querySelector("#location-status");
const locationSummaryPill = document.querySelector("#location-summary-pill");
const locationSummaryText = document.querySelector("#location-summary-text");
const useGpsButton = document.querySelector("#use-gps-button");
const retryGpsButton = document.querySelector("#retry-gps-button");
const useManualButton = document.querySelector("#use-manual-button");
const activeSourceText = document.querySelector("#active-source-text");
const locationHint = document.querySelector("#location-hint");
const locationStateCard = document.querySelector(".location-state-card");
const manualCard = document.querySelector(".manual-card");
const activeSourceCard = document.querySelector(".active-source-card");

const manualStreet = document.querySelector("#manual-street");
const manualNumber = document.querySelector("#manual-number");
const manualDistrict = document.querySelector("#manual-district");
const manualCity = document.querySelector("#manual-city");

const photoSummary = document.querySelector("#photo-summary");
const locationSummary = document.querySelector("#location-summary");
const reporterName = document.querySelector("#reporter-name");
const nameHint = document.querySelector("#name-hint");
const formFeedback = document.querySelector("#form-feedback");
const submitButton = document.querySelector("#submit-button");
const successState = document.querySelector("#success-state");
const successConfetti = document.querySelector("#success-confetti");
const resetButton = document.querySelector("#reset-button");
const protocolText = document.querySelector("#protocol-text");
const confettiPalette = ["#4f7a2e", "#d98c2b", "#7ea653", "#e7b45c", "#3a5c20", "#c9d9b4"];

function playSuccessConfetti() {
  if (!successConfetti) {
    return;
  }

  const pieces = Array.from({ length: 42 }, (_, index) => {
    const piece = document.createElement("span");
    piece.className = "confetti-piece";
    piece.style.setProperty("--confetti-left", `${2 + (index * 97) / 41}%`);
    piece.style.setProperty("--confetti-rotate", `${(index % 8) * 22}deg`);
    piece.style.setProperty("--confetti-delay", `${(index % 7) * 0.04}s`);
    piece.style.setProperty("--confetti-duration", `${2.3 + (index % 5) * 0.16}s`);
    piece.style.setProperty("--confetti-color", confettiPalette[index % confettiPalette.length]);
    piece.style.width = `${8 + (index % 4) * 2}px`;
    piece.style.height = `${14 + (index % 5) * 3}px`;
    return piece;
  });

  successConfetti.replaceChildren(...pieces);
  successConfetti.classList.remove("is-active");
  void successConfetti.offsetWidth;
  successConfetti.classList.add("is-active");

  window.setTimeout(() => {
    successConfetti.classList.remove("is-active");
    successConfetti.replaceChildren();
  }, 3200);
}

function setHint(element, message, type = "") {
  element.textContent = message;
  element.classList.remove("is-error", "is-success");

  if (type) {
    element.classList.add(type);
  }
}

function getManualAddress() {
  return {
    street: manualStreet.value.trim(),
    number: manualNumber.value.trim(),
    district: manualDistrict.value.trim(),
    city: manualCity.value.trim(),
  };
}

function hasManualAddress() {
  const address = getManualAddress();
  return Boolean(address.street && address.number && address.district && address.city);
}

function hasGpsLocation() {
  return Boolean(state.location);
}

function hasActiveLocation() {
  if (state.activeLocationSource === "gps") {
    return hasGpsLocation();
  }

  if (state.activeLocationSource === "manual") {
    return hasManualAddress();
  }

  return false;
}

function clearFormFeedback() {
  formFeedback.textContent = "";
  formFeedback.classList.remove("is-error", "is-success");
}

function updateProgress() {
  progressFill.style.width = `${(state.currentStep / 3) * 100}%`;

  stepIndicators.forEach((indicator) => {
    const indicatorStep = Number(indicator.dataset.stepIndicator);
    indicator.classList.toggle("is-active", indicatorStep === state.currentStep);
    indicator.classList.toggle("is-complete", indicatorStep < state.currentStep);
  });
}

function updatePhotoPreview() {
  if (!state.photoUrl) {
    photoPreview.classList.remove("has-image");
    previewImage.removeAttribute("src");
    photoSummary.textContent = "Aguardando foto";
    setHint(photoHint, "Adicione uma imagem para liberar o proximo passo.");
    return;
  }

  previewImage.src = state.photoUrl;
  photoPreview.classList.add("has-image");
  photoSummary.textContent = "Foto pronta para o envio";
  setHint(photoHint, "Perfeito. Sua foto ja esta pronta.", "is-success");
}

function updateLocationSummary() {
  if (state.activeLocationSource === "gps" && state.location) {
    locationSummary.textContent = `GPS confirmado (${state.location.latitude.toFixed(5)}, ${state.location.longitude.toFixed(5)})`;
    return;
  }

  if (state.activeLocationSource === "manual" && hasManualAddress()) {
    const address = getManualAddress();
    locationSummary.textContent = `${address.street}, ${address.number} - ${address.district}, ${address.city}`;
    return;
  }

  if (hasManualAddress()) {
    locationSummary.textContent = "Endereco preenchido, aguardando confirmacao";
    return;
  }

  if (state.gpsStatus === "success" && state.location) {
    locationSummary.textContent = "GPS confirmado";
    return;
  }

  locationSummary.textContent = "Aguardando confirmacao";
}

function updateLocationUi() {
  useGpsButton.disabled = state.gpsStatus === "loading";
  useManualButton.disabled = !hasManualAddress();
  locationStateCard.dataset.gpsState = state.gpsStatus;
  manualCard.dataset.manualReady = String(hasManualAddress());
  activeSourceCard.dataset.activeSource = state.activeLocationSource || "none";

  if (state.gpsStatus === "loading") {
    locationBadge.textContent = "Buscando GPS";
    locationSummaryPill.textContent = "Buscando";
    locationStatus.textContent = "Estamos tentando detectar seu local atual. Se preferir, ja pode preencher o endereco manual.";
    locationSummaryText.textContent = "Isso costuma levar poucos segundos quando a permissao esta ativa.";
  } else if (state.gpsStatus === "success" && state.location) {
    locationBadge.textContent = "GPS detectado";
    locationSummaryPill.textContent = "Disponivel";
    locationStatus.textContent = "Encontramos sua localizacao e ela ja foi selecionada para este envio.";
    locationSummaryText.textContent = `${state.location.latitude.toFixed(5)}, ${state.location.longitude.toFixed(5)}`;
  } else if (state.gpsStatus === "error") {
    locationBadge.textContent = "GPS indisponivel";
    locationSummaryPill.textContent = "Revisar";
    locationSummaryText.textContent = "Veja o motivo acima e tente novamente quando quiser.";
  } else {
    locationBadge.textContent = "GPS aguardando";
    locationSummaryPill.textContent = "Permissao";
    locationStatus.textContent = "Voce pode ativar sua localizacao ou preencher o endereco manual.";
    locationSummaryText.textContent = "Vamos pedir sua permissao antes de usar o GPS do celular.";
  }

  if (state.activeLocationSource === "gps" && state.location) {
    activeSourceText.textContent = "Local detectado selecionado para este envio.";
    setHint(locationHint, "GPS confirmado. Voce ja pode continuar.", "is-success");
  } else if (state.activeLocationSource === "manual" && hasManualAddress()) {
    activeSourceText.textContent = "Endereco manual selecionado para este envio.";
    setHint(locationHint, "Endereco confirmado. Voce ja pode continuar.", "is-success");
  } else if (hasManualAddress()) {
    activeSourceText.textContent = "Seu endereco manual esta completo e pronto para uso.";
    setHint(locationHint, "Endereco pronto. Voce pode continuar.");
  } else if (state.gpsStatus === "success" && hasGpsLocation()) {
    activeSourceText.textContent = "Seu GPS esta pronto para uso.";
    setHint(locationHint, "Local detectado. Voce pode continuar.");
  } else {
    activeSourceText.textContent = "Escolha uma origem valida para continuar.";
    setHint(locationHint, "Voce pode usar o GPS ou seguir com endereco manual.");
  }

  updateLocationSummary();
}

function updateControls() {
  stepOneContinue.disabled = !state.photoFile || state.submitting;
  stepTwoContinue.disabled = !hasActiveLocation() || state.submitting;
  submitButton.disabled = !(state.photoFile && hasActiveLocation() && reporterName.value.trim()) || state.submitting;
  submitButton.textContent = state.submitting ? "Enviando..." : "Enviar solicitacao";
}

function scrollToActivePanel(step) {
  const activePanel = stepPanels.find((panel) => Number(panel.dataset.step) === step);

  if (!activePanel) {
    return;
  }

  const topOffset = activePanel.getBoundingClientRect().top + window.scrollY - 16;
  window.scrollTo({ top: Math.max(0, topOffset), behavior: "smooth" });
}

function scrollToElement(element) {
  if (!element) {
    return;
  }

  const topOffset = element.getBoundingClientRect().top + window.scrollY - 16;
  window.scrollTo({ top: Math.max(0, topOffset), behavior: "smooth" });
}

function showStep(step) {
  state.currentStep = step;

  stepPanels.forEach((panel) => {
    const isActive = Number(panel.dataset.step) === step;
    panel.hidden = !isActive;
    panel.classList.toggle("is-active", isActive);
  });

  if (step === 3) {
    updateLocationSummary();
    reporterName.focus();
  }

  updateProgress();
  updateControls();
  scrollToActivePanel(step);
}

function setActiveLocationSource(source) {
  if (source === "gps" && !hasGpsLocation()) {
    return;
  }

  if (source === "manual" && !hasManualAddress()) {
    return;
  }

  state.activeLocationSource = source;
  updateLocationUi();
  updateControls();
}

function handlePhotoSelection(file) {
  if (!file) {
    return;
  }

  if (state.photoUrl) {
    URL.revokeObjectURL(state.photoUrl);
  }

  state.photoFile = file;
  state.photoUrl = URL.createObjectURL(file);
  updatePhotoPreview();
  updateControls();
}

function setGpsLoading() {
  state.location = null;
  if (state.activeLocationSource === "gps") {
    state.activeLocationSource = null;
  }
  state.gpsStatus = "loading";
  updateLocationUi();
  updateControls();
}

function setGpsFallback(message) {
  state.location = null;
  if (state.activeLocationSource === "gps") {
    state.activeLocationSource = null;
  }
  state.gpsStatus = "error";
  locationStatus.textContent = message;
  updateLocationUi();
  setHint(locationHint, "Nao foi possivel acessar o GPS. Use o endereco manual.", "is-error");
  updateControls();
}

function setGpsSuccess(latitude, longitude) {
  state.location = { latitude, longitude };
  state.gpsStatus = "success";
  state.activeLocationSource = "gps";
  updateLocationUi();
  updateControls();
}

function requestLocation() {
  if (!window.isSecureContext) {
    setGpsFallback("Esta pagina precisa estar em HTTPS para usar o GPS no celular.");
    return;
  }

  if (!("geolocation" in navigator)) {
    setGpsFallback("Seu navegador nao oferece suporte ao GPS.");
    return;
  }

  setGpsLoading();

  navigator.geolocation.getCurrentPosition(
    (position) => {
      setGpsSuccess(position.coords.latitude, position.coords.longitude);
    },
    (error) => {
      if (error.code === error.PERMISSION_DENIED) {
        setGpsFallback("Permissao de localizacao negada.");
        return;
      }

      if (error.code === error.TIMEOUT) {
        setGpsFallback("O GPS demorou mais que o esperado. Tente novamente em local aberto ou com internet ativa.");
        return;
      }

      if (error.code === error.POSITION_UNAVAILABLE) {
        setGpsFallback("Sua localizacao nao esta disponivel agora. Confira se o GPS do aparelho esta ativo.");
        return;
      }

      setGpsFallback("Nao foi possivel detectar sua localizacao agora.");
    },
    {
      enableHighAccuracy: true,
      timeout: 20000,
      maximumAge: 0,
    },
  );
}

function validateForm() {
  let valid = true;

  if (!state.photoFile) {
    setHint(photoHint, "Adicione uma foto para continuar.", "is-error");
    valid = false;
  }

  if (!hasActiveLocation()) {
    setHint(locationHint, "Confirme o GPS ou use o endereco manual.", "is-error");
    valid = false;
  }

  if (!reporterName.value.trim()) {
    setHint(nameHint, "Preencha seu nome.", "is-error");
    valid = false;
  } else {
    setHint(nameHint, "Tudo certo. Seu nome vai junto com o registro.", "is-success");
  }

  return valid;
}

function buildRequestBody() {
  const formData = new FormData();
  const manualAddress = getManualAddress();

  formData.append("photo", state.photoFile);
  formData.append("reporterName", reporterName.value.trim());
  formData.append("manualStreet", manualAddress.street);
  formData.append("manualNumber", manualAddress.number);
  formData.append("manualDistrict", manualAddress.district);
  formData.append("manualCity", manualAddress.city);
  formData.append("locationSource", state.activeLocationSource === "manual" ? "manual" : "gps");

  if (state.activeLocationSource === "gps" && state.location) {
    formData.append("latitude", String(state.location.latitude));
    formData.append("longitude", String(state.location.longitude));
  }

  return formData;
}

function setSubmitting(submitting) {
  state.submitting = submitting;

  if (submitting) {
    formFeedback.textContent = "Enviando sua solicitacao...";
    formFeedback.classList.remove("is-error");
  }

  updateControls();
}

function showSuccess(protocolCode) {
  form.hidden = true;
  successState.hidden = false;
  protocolText.textContent = `Protocolo gerado: ${protocolCode}. Seu registro foi preparado para acompanhamento pela prefeitura.`;
  playSuccessConfetti();
  scrollToElement(successState);
}

function resetForm() {
  form.reset();

  if (state.photoUrl) {
    URL.revokeObjectURL(state.photoUrl);
  }

  state.currentStep = 1;
  state.photoFile = null;
  state.photoUrl = "";
  state.location = null;
  state.gpsStatus = "idle";
  state.activeLocationSource = null;
  state.submitting = false;

  form.hidden = false;
  successState.hidden = true;
  protocolText.textContent = "";
  clearFormFeedback();
  setHint(nameHint, "Seu nome sera salvo junto ao registro.");
  updatePhotoPreview();
  updateLocationUi();
  showStep(1);
}

cameraButton.addEventListener("click", () => {
  photoInput.click();
});

photoInput.addEventListener("change", (event) => {
  const [file] = event.target.files;
  handlePhotoSelection(file);
});

stepOneContinue.addEventListener("click", () => {
  if (!state.photoFile) {
    setHint(photoHint, "Adicione uma foto para continuar.", "is-error");
    return;
  }

  showStep(2);
});

stepTwoBack.addEventListener("click", () => {
  showStep(1);
});

stepTwoContinue.addEventListener("click", () => {
  if (!hasActiveLocation()) {
    setHint(locationHint, "Escolha o GPS ou confirme um endereco manual.", "is-error");
    return;
  }

  showStep(3);
});

stepThreeBack.addEventListener("click", () => {
  showStep(2);
});

useGpsButton.addEventListener("click", () => {
  if (hasGpsLocation()) {
    setActiveLocationSource("gps");
    return;
  }

  requestLocation();
});

useManualButton.addEventListener("click", () => {
  setActiveLocationSource("manual");
});

retryGpsButton.addEventListener("click", () => {
  requestLocation();
});

[manualStreet, manualNumber, manualDistrict, manualCity].forEach((input) => {
  input.addEventListener("input", () => {
    if (hasManualAddress()) {
      state.activeLocationSource = "manual";
    } else if (state.activeLocationSource === "manual") {
      state.activeLocationSource = null;
    }

    updateLocationUi();
    updateControls();
  });
});

reporterName.addEventListener("input", () => {
  setHint(nameHint, "Seu nome sera salvo junto ao registro.");
  updateControls();
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  clearFormFeedback();

  if (!validateForm()) {
    formFeedback.textContent = "Revise os campos destacados para continuar.";
    formFeedback.classList.add("is-error");
    updateControls();
    return;
  }

  setSubmitting(true);

  try {
    const response = await fetch("/api/reports", {
      method: "POST",
      body: buildRequestBody(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Falha no envio.");
    }

    formFeedback.textContent = data.message;
    formFeedback.classList.remove("is-error");
    formFeedback.classList.add("is-success");
    showSuccess(data.report.protocol_code);
  } catch (error) {
    formFeedback.textContent = error.message || "Nao foi possivel enviar agora. Tente novamente em instantes.";
    formFeedback.classList.remove("is-success");
    formFeedback.classList.add("is-error");
  } finally {
    setSubmitting(false);
  }
});

resetButton.addEventListener("click", resetForm);

updatePhotoPreview();
updateLocationUi();
showStep(1);
