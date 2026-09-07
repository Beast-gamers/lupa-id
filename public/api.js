const AuthAPI = (() => {
  const BASE = "https://account-server-nine.vercel.app/api/auth";

  async function post(url, data) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    const text = await res.text();
    try { return JSON.parse(text); }
    catch { return { success: false, message: text }; }
  }

  return {
    register: (username, email, password) => post(`${BASE}/register`, { username, email, password }),
    verify: (email, code) => post(`${BASE}/verify`, { email, code }),
    login: (identifier, password) => post(`${BASE}/login`, { identifier, password }),
    forgotPassword: (email) => post(`${BASE}/forgotpassword`, { email }),
    resetPassword: (email, code, password) => post(`${BASE}/resetpassword`, { email, code, password }),
    googleLogin: async () => {
      const redirect = encodeURIComponent(window.location.origin);
      const res = await fetch(`${BASE}/google?redirect=${redirect}`);
      return res.json();
    },
    fetchAccount: async (token) => {
      const res = await fetch(`${BASE}/fetch?token=${encodeURIComponent(token)}`);
      return res.json();
    },
    change: (token, changeType, value, oldPassword) => {
      const body = { token, change: changeType, value };
      if (changeType === "password") body.oldPassword = oldPassword;
      return post(`${BASE}/change`, body);
    },
    verifyPassword: (token, password) => post(`${BASE}/verifypassword`, { token, password }),
    deleteAccount: (token, password, confirm) => post(`${BASE}/delete`, { token, password, confirm })
  };
})();
