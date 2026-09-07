(() => {
  const BASE = "https://account-server-nine.vercel.app/api/auth/dashboard";
  let password = null;
  let selectedField = "username";
  let currentUser = null;

  /* ── THEME TOGGLE ──────────────────────────────── */
  const themeBtn = document.getElementById("themeToggle");
  const themeIcon = themeBtn?.querySelector("i");
  function applyIcon() {
    const dark = document.documentElement.getAttribute("data-theme") === "dark";
    if (themeIcon) themeIcon.className = dark ? "bi bi-sun-fill" : "bi bi-moon-stars-fill";
  }
  applyIcon();
  themeBtn?.addEventListener("click", () => {
    const dark = document.documentElement.getAttribute("data-theme") === "dark";
    const next = dark ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    applyIcon();
  });

  /* ── PASSWORD TOGGLE ───────────────────────────── */
  document.querySelectorAll(".field-eye").forEach(btn => {
    btn.addEventListener("click", () => {
      const input = document.getElementById(btn.dataset.target);
      if (!input) return;
      const isPassword = input.type === "password";
      input.type = isPassword ? "text" : "password";
      const icon = btn.querySelector("i");
      if (icon) icon.className = isPassword ? "bi bi-unlock-fill" : "bi bi-lock-fill";
    });
  });

  /* ── API HELPER ────────────────────────────────── */
  async function api(action, params = {}) {
    const res = await fetch(BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, action, ...params }),
    });
    const text = await res.text();
    try { return JSON.parse(text); }
    catch { return { success: false, message: text }; }
  }

  /* ── POPUP ─────────────────────────────────────── */
  function showToast(message, isError = false) {
    let container = document.getElementById("toastContainer");
    if (!container) {
      container = document.createElement("div");
      container.id = "toastContainer";
      container.style.cssText = "position:fixed;top:1rem;right:1rem;z-index:9999;display:flex;flex-direction:column;gap:0.625rem;";
      document.body.appendChild(container);
    }
    const toast = document.createElement("div");
    toast.className = "toast-msg " + (isError ? "toast-error" : "toast-success");
    toast.innerHTML =
      '<i class="toast-icon bi ' + (isError ? "bi-exclamation-circle-fill" : "bi-check-circle-fill") + '"></i>' +
      '<span class="toast-text">' + (message || "Something went wrong") + '</span>' +
      '<button class="toast-close" aria-label="Close">&times;</button>';
    container.appendChild(toast);
    const timer = setTimeout(() => removeToast(toast), 4000);
    toast.querySelector(".toast-close").addEventListener("click", () => { clearTimeout(timer); removeToast(toast); });
  }
  function removeToast(el) {
    el.style.animation = "fadeUp 0.3s ease-out reverse forwards";
    el.addEventListener("animationend", () => el.remove());
  }

  /* ── LOGIN ─────────────────────────────────────── */
  const loginForm = document.getElementById("loginForm");
  const loginSection = document.getElementById("loginSection");
  const dashMain = document.getElementById("dashMain");
  const loginError = document.getElementById("loginError");
  const loginBtn = document.getElementById("loginBtn");

  loginForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const pw = document.getElementById("dashPassword").value.trim();
    if (!pw) return;
    loginBtn.disabled = true;
    loginBtn.querySelector(".btn-label").textContent = "Checking...";
    loginError.style.display = "none";

    const res = await api("view", { username: "__dashboard_auth_test__" });

    // 404 = password valid, account not found — that's expected
    if (res.success === false && res.message === "Account not found") {
      password = pw;
      loginSection.classList.add("hidden");
      dashMain.classList.remove("hidden");
      showToast("Dashboard unlocked");
    } else if (res.message && res.message.toLowerCase().includes("invalid dashboard password")) {
      loginError.textContent = res.message;
      loginError.style.display = "block";
    } else if (res.success === false && res.message) {
      loginError.textContent = res.message;
      loginError.style.display = "block";
    } else {
      // Fallback: treat any other unexpected success as password valid
      password = pw;
      loginSection.classList.add("hidden");
      dashMain.classList.remove("hidden");
      showToast("Dashboard unlocked");
    }

    loginBtn.disabled = false;
    loginBtn.querySelector(".btn-label").textContent = "Continue";
  });

  /* ── RADIO PILLS ───────────────────────────────── */
  const radioGroup = document.getElementById("searchRadios");
  const searchInput = document.getElementById("searchInput");

  radioGroup?.addEventListener("click", (e) => {
    const pill = e.target.closest(".radio-pill");
    if (!pill) return;
    radioGroup.querySelectorAll(".radio-pill").forEach(p => p.classList.remove("active"));
    pill.classList.add("active");
    selectedField = pill.dataset.field;
    const placeholders = { username: "username", email: "email", token: "token", id: "user ID" };
    if (searchInput) searchInput.placeholder = "Search by " + (placeholders[selectedField] || selectedField) + "...";
  });

  /* ── SEARCH ────────────────────────────────────── */
  const searchForm = document.getElementById("searchForm");
  const searchBtn = document.getElementById("searchBtn");
  const resultCard = document.getElementById("resultCard");
  const resultAvatar = document.getElementById("resultAvatar");
  const resultTitle = document.getElementById("resultTitle");
  const resultSubtitle = document.getElementById("resultSubtitle");
  const resultDetails = document.getElementById("resultDetails");
  const resultActions = document.getElementById("resultActions");

  searchForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const value = searchInput.value.trim();
    if (!value) return;
    searchBtn.disabled = true;
    searchBtn.innerHTML = '<i class="bi bi-arrow-repeat spin"></i> Searching...';

    const res = await api("view", { [selectedField]: value });

    resultCard.classList.add("visible");

    if (res.success && res.user) {
      currentUser = { field: selectedField, value, user: res.user };
      const u = res.user;
      resultAvatar.className = "result-avatar found";
      resultAvatar.innerHTML = '<i class="bi bi-person-fill"></i>';
      resultTitle.textContent = u.username || "Unknown";
      resultSubtitle.textContent = u.email || "";
      resultDetails.innerHTML = [
        detailRow("bi-hash", "ID", u.id),
        detailRow("bi-person", "Username", u.username),
        detailRow("bi-envelope", "Email", u.email),
        detailRow("bi-calendar-event", "Created", formatDate(u.createdAt)),
        detailRow("bi-key", "Token", truncate(u.token, 40)),
        detailRow("bi-clock-history", "Token expires", formatDate(u.tokenExpiresAt)),
      ].join("");
      resultActions.style.display = "";
    } else {
      currentUser = null;
      resultAvatar.className = "result-avatar not-found";
      resultAvatar.innerHTML = '<i class="bi bi-person-x-fill"></i>';
      resultTitle.textContent = "Not found";
      resultSubtitle.textContent = res.message || "No account matched your search.";
      resultDetails.innerHTML = "";
      resultActions.style.display = "none";
    }

    searchBtn.disabled = false;
    searchBtn.innerHTML = '<i class="bi bi-arrow-right-circle"></i> Search';
  });

  /* ── DELETE ─────────────────────────────────────── */
  const deleteBtn = document.getElementById("deleteBtn");
  const dcOverlay = document.getElementById("dcOverlay");
  const dcInput = document.getElementById("dcInput");
  const dcCancel = document.getElementById("dcCancel");
  const dcConfirm = document.getElementById("dcConfirm");

  deleteBtn?.addEventListener("click", () => {
    if (!currentUser) return;
    dcInput.value = "";
    dcOverlay.classList.add("open");
    setTimeout(() => dcInput.focus(), 100);
  });

  dcCancel?.addEventListener("click", () => dcOverlay.classList.remove("open"));
  dcOverlay?.addEventListener("click", (e) => { if (e.target === dcOverlay) dcOverlay.classList.remove("open"); });

  dcConfirm?.addEventListener("click", async () => {
    const val = dcInput.value.trim();
    if (val !== "CONFIRM") { showToast('Type "CONFIRM" to delete', true); return; }
    dcConfirm.disabled = true;
    dcConfirm.textContent = "Deleting...";

    const res = await api("delete", { [currentUser.field]: currentUser.value });

    dcOverlay.classList.remove("open");
    dcConfirm.disabled = false;
    dcConfirm.textContent = "Delete forever";
    dcInput.value = "";

    if (res.success) {
      showToast("Account deleted successfully");
      resultCard.classList.remove("visible");
      currentUser = null;
      searchInput.value = "";
    } else {
      showToast(res.message || "Delete failed", true);
    }
  });

  /* ── HELPERS ───────────────────────────────────── */
  function detailRow(icon, label, value) {
    const v = value || "—";
    return '<div class="detail-row">' +
      '<div class="detail-icon"><i class="bi ' + icon + '"></i></div>' +
      '<div class="detail-info"><div class="detail-label">' + label + '</div>' +
      '<div class="detail-value">' + escapeHtml(v) + '</div></div></div>';
  }

  function formatDate(d) {
    if (!d) return null;
    try { return new Date(d).toLocaleString(); }
    catch { return d; }
  }

  function truncate(s, max) {
    if (!s) return null;
    return s.length > max ? s.slice(0, max) + "..." : s;
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }
})();