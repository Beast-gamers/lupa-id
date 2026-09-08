/* ── DEBUG CONFIG ─────────────────────────────────────── */
const BASE_URL = "https://account-server-nine.vercel.app";

/* ── NAVIGATION ─────────────────────────────────────── */
function navigate(page, section) {
  const pages = ['page-home', 'page-auth', 'page-dashboard'];
  pages.forEach(p => document.getElementById(p).classList.add('hidden'));
  document.getElementById('page-' + page).classList.remove('hidden');

  if (page === 'auth' && section) {
    showAuthSection(section);
  }
  if (page === 'dashboard' && section) {
    showDashSection(section);
  }
  window.scrollTo(0, 0);
}

function showAuthSection(id) {
  document.querySelectorAll('.auth-section').forEach(s => s.classList.add('hidden'));
  const sec = document.getElementById('sec-' + id);
  if (sec) {
    sec.classList.remove('hidden');
    sec.style.animation = 'none';
    sec.offsetHeight;
    sec.style.animation = '';
  }
  const titles = {
    register: ['Create account', 'Fill in the details to get started'],
    login: ['Welcome back', 'Sign in to your account'],
    verify: ['Verify your email', 'Enter the code we sent you'],
    forgot: ['Reset password', "We'll send a reset code to your email"],
    reset: ['Set new password', 'Enter the code and choose a new password']
  };
  const [t, s] = titles[id] || ['', ''];
  const titleEl = document.getElementById('auth-title');
  const subEl = document.getElementById('auth-subtitle');
  if (titleEl) titleEl.textContent = t;
  if (subEl) {
    if (id === 'verify') {
      const email = getCookie('register_email');
      subEl.textContent = 'Enter the code we sent you';
    } else {
      subEl.textContent = s;
    }
  }
}

function showDashSection(id) {
  document.querySelectorAll('.dash-section').forEach(s => s.classList.add('hidden'));
  const sec = document.getElementById('dash-' + id);
  if (sec) {
    sec.classList.remove('hidden');
    sec.style.animation = 'none';
    sec.offsetHeight;
    sec.style.animation = 'dashIn 0.35s ease-out';
  }
  document.querySelectorAll('.sidebar-tab').forEach(b => b.classList.remove('active'));
  const tab = document.querySelector(`.sidebar-tab[data-dash="${id}"]`);
  if (tab) tab.classList.add('active');
  const titles = { account: 'My Account', change: 'Account Settings', password: 'Change Password', delete: 'Delete Account' };
  const titleEl = document.getElementById('dashTopbarTitle');
  if (titleEl) titleEl.textContent = titles[id] || '';
}

function openSubView(secId, title) {
  document.querySelectorAll('.dash-section').forEach(s => s.classList.add('hidden'));
  const sec = document.getElementById(secId);
  if (sec) {
    sec.classList.remove('hidden');
    sec.style.animation = 'none';
    sec.offsetHeight;
    sec.style.animation = 'dashIn 0.35s ease-out';
  }
  document.querySelectorAll('.sidebar-tab').forEach(b => b.classList.remove('active'));
  const tab = document.querySelector('.sidebar-tab[data-dash="change"]');
  if (tab) tab.classList.add('active');
  const titleEl = document.getElementById('dashTopbarTitle');
  if (titleEl) titleEl.textContent = title;
  window.scrollTo(0, 0);
}

/* ── HELPERS ────────────────────────────────────────── */
function showPopup(message, isError) {
  const container = document.getElementById('popupContainer');
  if (!container) return;
  const popup = document.createElement('div');
  popup.className = 'popup ' + (isError ? 'error' : 'success');
  const iconClass = isError ? 'bi-exclamation-circle-fill' : 'bi-check-circle-fill';
  popup.innerHTML = '<i class="popup-icon bi ' + iconClass + '"></i><span class="popup-msg">' + (message || 'Unknown error') + '</span><button class="popup-close" aria-label="Close">&times;</button>';
  container.appendChild(popup);
  const timer = setTimeout(() => dismissPopup(popup), 5000);
  popup.querySelector('.popup-close').addEventListener('click', () => { clearTimeout(timer); dismissPopup(popup); });
}
function dismissPopup(popup) {
  popup.classList.add('popup-out');
  popup.addEventListener('animationend', () => popup.remove());
  setTimeout(() => { if (popup.parentNode) popup.remove(); }, 300);
}

function setLoading(btnId, loading) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  if (loading) {
    btn.disabled = true;
    btn.dataset.origText = btn.innerHTML;
    btn.innerHTML = '<span class="spinner-sm"></span>Processing...';
  } else {
    btn.disabled = false;
    btn.innerHTML = btn.dataset.origText || btn.innerHTML;
  }
}

function showToast(message, type) {
  const toastEl = document.getElementById('appToast');
  const span = toastEl.querySelector('.toast-body span');
  const icon = toastEl.querySelector('.toast-icon');
  span.textContent = message;
  icon.className = 'toast-icon bi ' + (type === 'success' ? 'bi-check-circle-fill text-success' : 'bi-exclamation-circle-fill text-danger');
  new bootstrap.Toast(toastEl, { delay: 3000 }).show();
}

function getToken() { return localStorage.getItem('token'); }
function setToken(t) { localStorage.setItem('token', t); }
function removeToken() { localStorage.removeItem('token'); localStorage.removeItem('user'); }

function isInvalidToken(data) {
  return !!data && !data.success && (data.message === 'Invalid token' || data.message === 'Token expired');
}
function handleInvalidToken() {
  removeToken();
  showToast('Invalid token', 'error');
  navigate('home');
}

function setCookie(name, value, minutes) {
  const expires = new Date(Date.now() + minutes * 60 * 1000).toUTCString();
  document.cookie = name + '=' + encodeURIComponent(value) + ';expires=' + expires + ';path=/;SameSite=Lax';
}
function getCookie(name) {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : '';
}
function deleteCookie(name) {
  document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Lax';
}

function fillTokens() {
  const t = getToken();
  if (t) {
    const ct = document.getElementById('c_token');
    const pt = document.getElementById('p_token');
    const dt = document.getElementById('d_token');
    if (ct) ct.value = t;
    if (pt) pt.value = t;
    if (dt) dt.value = t;
  }
}

/* ── THEME ───────────────────────────────────────── */
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light');
  const lt = document.getElementById('themeLight');
  const dt = document.getElementById('themeDark');
  if (lt) lt.classList.toggle('active', theme !== 'dark');
  if (dt) dt.classList.toggle('active', theme === 'dark');
}
function initTheme() {
  let saved = localStorage.getItem('theme');
  if (!saved) saved = (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
  applyTheme(saved);
}

/* ── REDIRECT PARAMS (from verify/forgot flows) ────── */
function handleRedirectParams() {
  const params = new URLSearchParams(window.location.search);
  const fpEmail = params.get('fp_email');
  const hash = window.location.hash;

  /* ── Return from verify page: #ve=EMAIL ── */
  if (hash && hash.startsWith('#ve=')) {
    const raw = decodeURIComponent(hash.substring(4));
    const email = raw.split('?')[0];
    setCookie('register_email', email, 10);
    navigate('auth', 'verify');
    const vEmail = document.getElementById('v_email');
    vEmail.value = email;
    /* Hide the email field wrapper — user only sees OTP input */
    vEmail.closest('.field').style.display = 'none';
    showPopup('Code sent! Check your inbox for the verification code.', false);
    showToast('Verification code sent!', 'success');
    history.replaceState(null, '', window.location.pathname);
    return;
  }

  /* ── Return from Google OAuth: ?g_token=JWT or ?g_error=ERR ── */
  if (params.get('g_token') || params.get('g_error')) {
    const token = params.get('g_token');
    const err = params.get('g_error');
    if (token) {
      setToken(token);
      fillTokens();
      history.replaceState(null, '', window.location.pathname);
      navigate('dashboard', 'account');
      fetchAccountUI();
      showToast('Signed in with Google!', 'success');
    } else {
      history.replaceState(null, '', window.location.pathname);
      showPopup('Google sign-in failed: ' + (err || 'Unknown error'), true);
      navigate('auth', 'login');
    }
    return;
  }

  /* ── Return from forgot-password page: #fe=EMAIL ── */
  if (hash && hash.startsWith('#fe=')) {
    const raw = decodeURIComponent(hash.substring(4));
    const email = raw.split('?')[0];
    navigate('auth', 'reset');
    const rpEmail = document.getElementById('rp_email');
    rpEmail.value = email;
    rpEmail.closest('.field').style.display = 'none';
    history.replaceState(null, '', window.location.pathname);
    return;
  }

  /* ── Return from forgot-password flow ── */
  let hp = new URLSearchParams();
  if (hash && hash.startsWith('#?')) hp = new URLSearchParams(hash.substring(2));
  const success = hp.get('success') || params.get('success');
  const message = hp.get('message') || params.get('message');

  if (fpEmail && success && message) {
    document.getElementById('m_email').value = fpEmail;
    showPopup(decodeURIComponent(message), success !== 'true');
    new bootstrap.Modal(document.getElementById('resetModal')).show();
    history.replaceState(null, '', window.location.pathname + '?fp_email=' + encodeURIComponent(fpEmail));
  } else if (success && message) {
    const msg = decodeURIComponent(message);
    const ok = success === 'true';
    if (ok) {
      navigate('auth', 'login');
      showPopup(msg, false);
    } else {
      navigate('auth', 'register');
      showPopup(msg, true);
    }
    history.replaceState(null, '', window.location.pathname);
  }
}

/* ── FETCH ACCOUNT ──────────────────────────────────── */
async function fetchAccountUI() {
  const token = getToken();
  const infoDiv = document.getElementById('account_info');
  const accountCard = document.getElementById('accountCard');
  const skeleton = document.getElementById('accountSkeleton');
  const showSkeleton = () => { if (skeleton) skeleton.classList.remove('hidden'); if (accountCard) accountCard.classList.add('hidden'); };
  const showCard = () => { if (skeleton) skeleton.classList.add('hidden'); if (accountCard) accountCard.classList.remove('hidden'); };
  showSkeleton();
  if (!token) { showPopup('Not logged in', true); return; }
  try {
    const data = await AuthAPI.fetchAccount(token);
    if (data.success && data.user) {
      const igUser = document.getElementById('igUsernameDisplay');
      if (igUser) igUser.textContent = data.user.username;
      const igPassUser = document.getElementById('igPasswordDisplay');
      if (igPassUser) igPassUser.textContent = data.user.username;
      const cUsername = document.getElementById('c_username');
      const cEmail = document.getElementById('c_email');
      if (cUsername) cUsername.value = data.user.username;
      if (cEmail) cEmail.value = data.user.email;
      infoDiv.innerHTML = `
        <div class="detail-row"><div class="detail-icon"><i class="bi bi-person"></i></div><div><div class="detail-label">Username</div><div class="detail-value">${data.user.username}</div></div></div>
        <div class="detail-row"><div class="detail-icon"><i class="bi bi-envelope"></i></div><div><div class="detail-label">Email</div><div class="detail-value">${data.user.email}</div></div></div>`;
      showCard();
    } else {
      if (isInvalidToken(data)) { handleInvalidToken(); return; }
      showPopup(data.message || 'Failed to load account', true);
      if (skeleton) skeleton.classList.add('hidden');
      removeToken();
    }
  } catch {
    showPopup('Error fetching account info', true);
    if (skeleton) skeleton.classList.add('hidden');
  }
}

/* ── BOOT ───────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {

  /* --- Dashboard tabs --- */
  document.querySelectorAll('.sidebar-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      showDashSection(btn.dataset.dash);
      if (window.innerWidth <= 768) closeSidebar();
    });
  });

  /* --- Sidebar toggle --- */
  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('dashSidebar');
  let overlay = document.createElement('div');
  overlay.className = 'sidebar-overlay';
  document.getElementById('page-dashboard').appendChild(overlay);

  function closeSidebar() {
    sidebar.classList.remove('open');
    overlay.classList.remove('visible');
  }

  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', () => {
      if (window.innerWidth <= 768) {
        sidebar.classList.toggle('open');
        overlay.classList.toggle('visible');
      } else {
        sidebar.classList.toggle('collapsed');
      }
    });
  }

  overlay.addEventListener('click', closeSidebar);

  initTheme();

  handleRedirectParams();

  /* If logged out but a pending verification email exists (e.g. after a tab
     reload wiped the URL hash), resume the verify flow from the cookie. */
  const pendingEmail = getCookie('register_email');
  if (!getToken() && pendingEmail) {
    navigate('auth', 'verify');
    const vEmail = document.getElementById('v_email');
    if (vEmail) {
      vEmail.value = pendingEmail;
      vEmail.closest('.field').style.display = 'none';
    }
  }

  /* If already logged in, skip home */
  if (getToken()) {
    navigate('dashboard', 'account');
    fillTokens();
    fetchAccountUI();
  }

  /* ── REGISTER ── */
  const registerBtn = document.getElementById('registerBtn');
  if (registerBtn) {
    registerBtn.addEventListener('click', async () => {
      const username = document.getElementById('r_username').value.trim();
      const email = document.getElementById('r_email').value.trim();
      const password = document.getElementById('r_password').value;
      if (!username || !email || !password) {
        showPopup('All fields are required', true);
        return;
      }
      setLoading('registerBtn', true);
      try {
        const data = await AuthAPI.register(username, email, password);
        if (data.success) {
          setCookie('register_email', email, 10);
          /* Redirect to external verify page with &url pointing back here + #ve=EMAIL */
          const returnBase = window.location.origin + window.location.pathname;
          const returnUrl = returnBase + '#ve=' + encodeURIComponent(email);
          window.location.href = 'https://verify-email-nu.vercel.app/pending?email=' + encodeURIComponent(email) + '&url=' + encodeURIComponent(returnUrl);
          return;
        } else {
          showPopup(data.message || 'Registration failed', true);
        }
      } catch {
        showPopup('Network error', true);
      }
      setLoading('registerBtn', false);
    });
  }

  /* ── VERIFY CLOSE — clear pending verification and go home ── */
  const verifyCloseBtn = document.getElementById('verifyCloseBtn');
  if (verifyCloseBtn) {
    verifyCloseBtn.addEventListener('click', () => {
      deleteCookie('register_email');
      navigate('home');
    });
  }

  /* ── VERIFY ── */
  const verifyBtn = document.getElementById('verifyBtn');
  if (verifyBtn) {
    verifyBtn.addEventListener('click', async () => {
      const emailFromCookie = getCookie('register_email');
      const emailFromInput = document.getElementById('v_email').value.trim();
      const email = emailFromCookie || emailFromInput;
      const code = document.getElementById('v_code').value.trim();

      if (!code) {
        showPopup('Please enter the verification code', true);
        setLoading('verifyBtn', false);
        return;
      }

      setLoading('verifyBtn', true);

      try {
        const data = await AuthAPI.verify(email, code);
        showPopup(data.message || 'Verification failed', !data.success);
        if (data.success) {
          deleteCookie('register_email');
          showToast('Email verified!', 'success');
          setTimeout(() => {
            showAuthSection('login');
            document.getElementById('l_id').value = email;
          }, 1200);
        }
      } catch (err) {
        showPopup('Network error', true);
      }
      setLoading('verifyBtn', false);
    });
  }

  /* ── RESEND — redirect back to external verify page ── */
  const resendLink = document.getElementById('resendLink');
  if (resendLink) {
    resendLink.addEventListener('click', () => {
      const email = getCookie('register_email') || document.getElementById('v_email').value.trim();
      if (!email) { showAuthSection('register'); return; }
      const returnBase = window.location.origin + window.location.pathname;
      const returnUrl = returnBase + '#ve=' + encodeURIComponent(email);
      window.location.href = 'https://verify-email-nu.vercel.app/pending?email=' + encodeURIComponent(email) + '&url=' + encodeURIComponent(returnUrl);
    });
  }

  /* ── LOGIN ── */
  const googleLoginBtn = document.getElementById('googleLoginBtn');
  if (googleLoginBtn) {
    googleLoginBtn.addEventListener('click', async () => {
      setLoading('googleLoginBtn', true);
      try {
        const data = await AuthAPI.googleLogin();
        if (data.success && data.url) {
          window.location.href = data.url;
          return;
        } else {
          showPopup(data.message || 'Google login unavailable', true);
        }
      } catch {
        showPopup('Network error', true);
      }
      setLoading('googleLoginBtn', false);
    });
  }

  const loginBtn = document.getElementById('loginBtn');
  if (loginBtn) {
    loginBtn.addEventListener('click', async () => {
      const identifier = document.getElementById('l_id').value.trim();
      const password = document.getElementById('l_pass').value;
      if (!identifier || !password) {
        showPopup('All fields are required', true);
        return;
      }
      setLoading('loginBtn', true);
      try {
        const data = await AuthAPI.login(identifier, password);
        if (data.success && data.token) {
          setToken(data.token);
          fillTokens();
          showToast('Welcome back!', 'success');
          navigate('dashboard', 'account');
          fetchAccountUI();
        } else {
          showPopup(data.message || 'Login failed', true);
        }
      } catch {
        showPopup('Network error', true);
      }
      setLoading('loginBtn', false);
    });
  }

  /* ── FORGOT PASSWORD ── */
  const forgotLink = document.getElementById('forgotLink');
  if (forgotLink) forgotLink.addEventListener('click', (e) => { e.preventDefault(); showAuthSection('forgot'); });

  const forgotBtn = document.getElementById('forgotBtn');
  if (forgotBtn) {
    forgotBtn.addEventListener('click', async () => {
      const email = document.getElementById('fp_email').value.trim();
      if (!email) { showPopup('Enter your email', true); return; }
      setLoading('forgotBtn', true);
      try {
        const returnBase = window.location.origin + window.location.pathname;
        const returnUrl = returnBase + '#fe=' + encodeURIComponent(email);
        window.location.href = `https://forgot-password-five.vercel.app/forgot?email=${encodeURIComponent(email)}&url=${encodeURIComponent(returnUrl)}`;
      } catch {
        showPopup('Network error', true);
      }
      setLoading('forgotBtn', false);
    });
  }

  /* ── RESET PASSWORD ── */
  const resetBtn = document.getElementById('resetBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', async () => {
      const email = document.getElementById('rp_email').value.trim();
      const code = document.getElementById('rp_code').value.trim();
      const password = document.getElementById('rp_password').value;
      if (!email || !code || !password) { showPopup('All fields are required', true); return; }
      setLoading('resetBtn', true);
      try {
        const data = await AuthAPI.resetPassword(email, code, password);
        showPopup(data.message || 'Reset failed', !data.success);
        if (data.success) { showToast('Password reset!', 'success'); setTimeout(() => showAuthSection('login'), 1200); }
      } catch {
        showPopup('Network error', true);
      }
      setLoading('resetBtn', false);
    });
  }

  /* ── MODAL RESET ── */
  const modalResetBtn = document.getElementById('modalResetBtn');
  if (modalResetBtn) {
    modalResetBtn.addEventListener('click', async () => {
      const email = document.getElementById('m_email').value.trim();
      const code = document.getElementById('m_code').value.trim();
      const password = document.getElementById('m_password').value;
      if (!email || !code || !password) { showPopup('All fields are required', true); return; }
      setLoading('modalResetBtn', true);
      try {
        const data = await AuthAPI.resetPassword(email, code, password);
        showPopup(data.message || 'Reset failed', !data.success);
        if (data.success) {
          showToast('Password reset!', 'success');
          setTimeout(() => {
            bootstrap.Modal.getInstance(document.getElementById('resetModal'))?.hide();
            history.replaceState(null, '', window.location.pathname);
            showAuthSection('login');
          }, 1500);
        }
      } catch {
        showPopup('Network error', true);
      }
      setLoading('modalResetBtn', false);
    });
  }

  /* ── THEME ── */
  const themeLight = document.getElementById('themeLight');
  if (themeLight) {
    themeLight.addEventListener('click', () => {
      localStorage.setItem('theme', 'light');
      applyTheme('light');
      showToast('Light theme applied', 'success');
    });
  }
  const themeDark = document.getElementById('themeDark');
  if (themeDark) {
    themeDark.addEventListener('click', () => {
      localStorage.setItem('theme', 'dark');
      applyTheme('dark');
      showToast('Dark theme applied', 'success');
    });
  }

  /* ── SETTINGS SUB-VIEWS ── */
  const openCredentialsBtn = document.getElementById('openCredentialsBtn');
  if (openCredentialsBtn) openCredentialsBtn.addEventListener('click', () => openSubView('dash-credentials', 'Change Credentials'));
  const backCredentialsBtn = document.getElementById('backCredentialsBtn');
  if (backCredentialsBtn) backCredentialsBtn.addEventListener('click', () => showDashSection('change'));

  const openThemeBtn = document.getElementById('openThemeBtn');
  if (openThemeBtn) openThemeBtn.addEventListener('click', () => openSubView('dash-theme', 'Theme'));
  const backThemeBtn = document.getElementById('backThemeBtn');
  if (backThemeBtn) backThemeBtn.addEventListener('click', () => showDashSection('change'));

  const openPasswordBtn = document.getElementById('openPasswordBtn');
  if (openPasswordBtn) openPasswordBtn.addEventListener('click', () => openSubView('dash-password', 'Change Password'));
  const backPasswordBtn = document.getElementById('backPasswordBtn');
  if (backPasswordBtn) backPasswordBtn.addEventListener('click', () => showDashSection('change'));

  const openDeleteBtn = document.getElementById('openDeleteBtn');
  if (openDeleteBtn) openDeleteBtn.addEventListener('click', () => openSubView('dash-delete', 'Delete Account'));
  const backDeleteBtn = document.getElementById('backDeleteBtn');
  if (backDeleteBtn) backDeleteBtn.addEventListener('click', () => showDashSection('change'));

  /* ── CHANGE (Settings: username + email) ── */
  const changeBtn = document.getElementById('changeBtn');
  if (changeBtn) {
    changeBtn.addEventListener('click', async () => {
      const token = document.getElementById('c_token').value.trim();
      const newUsername = document.getElementById('c_username').value.trim();
      const newEmail = document.getElementById('c_email').value.trim();
      if (!token) { showPopup('Not authenticated', true); return; }
      if (!newUsername && !newEmail) { showPopup('Enter a username or email to update', true); return; }
      setLoading('changeBtn', true);
      try {
        const origUsername = document.getElementById('c_username').value.trim();
        const origEmail = document.getElementById('c_email').value.trim();
        const results = [];
        if (newUsername) {
          const usernameData = await AuthAPI.change(token, 'username', newUsername);
          if (usernameData.success && usernameData.token) { setToken(usernameData.token); fillTokens(); }
          results.push({ type: 'username', value: newUsername, orig: origUsername, ...usernameData });
        }
        if (newEmail) {
          const emailData = await AuthAPI.change(token, 'email', newEmail);
          if (emailData.success && emailData.token) { setToken(emailData.token); fillTokens(); }
          results.push({ type: 'email', value: newEmail, orig: origEmail, ...emailData });
        }
        if (results.length) {
          if (results.some(r => isInvalidToken(r))) { handleInvalidToken(); setLoading('changeBtn', false); return; }
          const allSuccess = results.every(r => r.success);
          const failures = results.filter(r => !r.success);
          if (allSuccess) {
            showToast('Updated!', 'success');
            fetchAccountUI();
          } else {
            for (const s of results) {
              if (s.success) {
                const revertData = await AuthAPI.change(token, s.type, s.orig);
                if (revertData.success && revertData.token) { setToken(revertData.token); fillTokens(); }
              }
            }
            const msg = failures.map(f => f.message || `Failed to update ${f.type}`).join('. ');
            showPopup(msg, true);
            fetchAccountUI();
          }
        }
      } catch {
        showPopup('Network error', true);
      }
      setLoading('changeBtn', false);
    });
  }

  /* ── CHANGE PASSWORD ── */
  const passwordBtn = document.getElementById('passwordBtn');
  if (passwordBtn) {
    passwordBtn.addEventListener('click', async () => {
      const token = document.getElementById('p_token').value.trim();
      const oldPass = document.getElementById('p_oldpass').value;
      const newPass = document.getElementById('p_newpass').value;
      if (!token) { showPopup('Not authenticated', true); return; }
      if (!oldPass || !newPass) { showPopup('Both fields are required', true); return; }
      setLoading('passwordBtn', true);
      try {
        const data = await AuthAPI.change(token, 'password', newPass, oldPass);
        if (isInvalidToken(data)) { handleInvalidToken(); return; }
        showPopup(data.message || 'Password change failed', !data.success);
        if (data.success) {
          showToast('Password changed!', 'success');
          document.getElementById('p_oldpass').value = '';
          document.getElementById('p_newpass').value = '';
          if (data.token) { setToken(data.token); fillTokens(); }
        }
      } catch {
        showPopup('Network error', true);
      }
      setLoading('passwordBtn', false);
    });
  }

  /* ── DELETE ── */
  let _pendingDeletePassword = '';
  const deleteBtn = document.getElementById('deleteBtn');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', async () => {
      const password = document.getElementById('d_password').value;
      if (!password) { showPopup('Please enter your password', true); return; }
      setLoading('deleteBtn', true);
      try {
        const token = getToken();
        if (!token) { showPopup('Not authenticated', true); setLoading('deleteBtn', false); return; }
        const data = await AuthAPI.verifyPassword(token, password);
        if (isInvalidToken(data)) { handleInvalidToken(); setLoading('deleteBtn', false); return; }
        if (data.success) {
          _pendingDeletePassword = password;
          document.getElementById('dc_confirm').value = '';
          const modal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
          modal.show();
        } else {
          showPopup(data.message || 'Incorrect password', true);
        }
      } catch {
        showPopup('Network error', true);
      }
      setLoading('deleteBtn', false);
    });
  }

  /* ── DELETE CONFIRM (modal) ── */
  const deleteConfirmBtn = document.getElementById('deleteConfirmBtn');
  if (deleteConfirmBtn) {
    deleteConfirmBtn.addEventListener('click', async () => {
      const cv = document.getElementById('dc_confirm').value;
      if (cv !== 'CONFIRM') { showPopup('Type "CONFIRM" to delete your account', true); return; }
      setLoading('deleteConfirmBtn', true);
      try {
        const token = getToken();
        const data = await AuthAPI.deleteAccount(token, _pendingDeletePassword, cv);
        if (isInvalidToken(data)) { handleInvalidToken(); setLoading('deleteConfirmBtn', false); return; }
        showPopup(data.message || 'Delete failed', !data.success);
        if (data.success) {
          _pendingDeletePassword = '';
          removeToken();
          bootstrap.Modal.getInstance(document.getElementById('deleteConfirmModal'))?.hide();
          showToast('Account deleted.', 'success');
          setTimeout(() => {
            navigate('home');
            document.getElementById('d_password').value = '';
            document.getElementById('dc_confirm').value = '';
          }, 1500);
        }
      } catch {
        showPopup('Network error', true);
      }
      setLoading('deleteConfirmBtn', false);
    });
  }

  /* ── LOGOUT ── */
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      new bootstrap.Modal(document.getElementById('logoutConfirmModal')).show();
    });
  }
  const logoutConfirmBtn = document.getElementById('logoutConfirmBtn');
  if (logoutConfirmBtn) {
    logoutConfirmBtn.addEventListener('click', () => {
      removeToken();
      bootstrap.Modal.getInstance(document.getElementById('logoutConfirmModal'))?.hide();
      showToast('Logged out', 'success');
      navigate('home');
    });
  }
});
