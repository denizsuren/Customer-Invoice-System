/*
  DOSYA: authService.js

  Backend'deki POST /api/auth/login endpoint'iyle konuşan giriş katmanı.

  - Başarılı girişte backend'in döndürdüğü token ve yönetici bilgisi
    sessionStorage'da saklanır (sekme kapanınca otomatik silinir).
  - login() hata durumunda apiClient'ın fırlattığı Error'ı aynen yukarı
    iletir; LoginPage bu mesajı ("E-posta veya şifre hatalı") kullanıcıya gösterir.
*/

import { apiRequest, isApiEnabled, TOKEN_STORAGE_KEY } from "./apiClient";

const TOKEN_KEY = TOKEN_STORAGE_KEY;
const ADMIN_KEY = "pia-auth-admin";

export async function login(email, password) {
  if (!isApiEnabled()) {
    // API kapalıyken (mock modu) girişte takılı kalmamak için serbest geçiş.
    return { token: "mock", email, fullName: "Mock Yönetici", role: "ADMIN" };
  }

  const response = await apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  window.sessionStorage.setItem(TOKEN_KEY, response.token);
  window.sessionStorage.setItem(
    ADMIN_KEY,
    JSON.stringify({ email: response.email, fullName: response.fullName, role: response.role }),
  );

  return response;
}

export function logout() {
  window.sessionStorage.removeItem(TOKEN_KEY);
  window.sessionStorage.removeItem(ADMIN_KEY);
}

export function getStoredAdmin() {
  try {
    const raw = window.sessionStorage.getItem(ADMIN_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getToken() {
  return window.sessionStorage.getItem(TOKEN_KEY);
}
