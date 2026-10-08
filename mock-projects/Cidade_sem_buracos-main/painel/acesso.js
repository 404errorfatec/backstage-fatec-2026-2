const loginForm = document.querySelector("#login-form");
const usernameInput = document.querySelector("#username");
const passwordInput = document.querySelector("#password");
const loginButton = document.querySelector("#login-button");
const loginFeedback = document.querySelector("#login-feedback");

function setFeedback(message, type = "") {
  loginFeedback.textContent = message;
  loginFeedback.classList.remove("is-error", "is-success");

  if (type) {
    loginFeedback.classList.add(type);
  }
}

async function checkSession() {
  try {
    const response = await fetch("/api/session", {
      credentials: "same-origin",
    });

    if (!response.ok) {
      return;
    }

    const data = await response.json();

    if (data.ok) {
      window.location.href = "/painel";
    }
  } catch (_error) {
    setFeedback("Nao foi possivel validar a sessao atual.", "is-error");
  }
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const username = usernameInput.value.trim();
  const password = passwordInput.value;

  if (!username || !password) {
    setFeedback("Preencha usuario e senha para continuar.", "is-error");
    return;
  }

  loginButton.disabled = true;
  setFeedback("Validando acesso...");

  try {
    const response = await fetch("/api/session/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "same-origin",
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      setFeedback(data.message || "Nao foi possivel entrar agora.", "is-error");
      loginButton.disabled = false;
      return;
    }

    setFeedback("Acesso liberado. Redirecionando...", "is-success");
    window.location.href = "/painel";
  } catch (_error) {
    setFeedback("Falha de conexao ao tentar entrar.", "is-error");
    loginButton.disabled = false;
  }
});

checkSession();
