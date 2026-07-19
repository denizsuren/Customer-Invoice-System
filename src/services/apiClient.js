/*
  DOSYA: apiClient.js

  Frontend'in ortak HTTP katmanıdır.
  Service dosyaları doğrudan fetch detayını tekrar etmez; burada toplanır.

  .env içindeki VITE_API_URL şu şekilde olmalı:
  VITE_API_URL=http://localhost:8080/api

  Böylece apiRequest("/customers") çağrısı şu adrese gider:
  http://localhost:8080/api/customers
*/
const API_URL = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");

export const TOKEN_STORAGE_KEY = "pia-auth-token";

function getAuthToken() {
  return window.sessionStorage.getItem(TOKEN_STORAGE_KEY);
}

export function isApiEnabled() {
  return Boolean(API_URL);
}

const validationFieldLabels = {
  email: "E-posta",
  name: "Ad",
  surname: "Soyad",
  phone: "Telefon",
  regionId: "Bölge",
  invoiceAmount: "Fatura tutarı",
  dueAmount: "Ödenecek tutar",
  invoiceDate: "Fatura tarihi",
  dueDate: "Son ödeme tarihi",
};

function formatValidationDetail(detail) {
  const [field, ...messageParts] = String(detail).split(":");
  const message = messageParts.join(":").trim();
  const label = validationFieldLabels[field.trim()] ?? field.trim();

  return message ? `${label}: ${message}` : String(detail);
}

function formatApiError(payload, fallbackMessage) {
  if (Array.isArray(payload?.details) && payload.details.length) {
    const details = payload.details.map(formatValidationDetail);
    return `${payload?.message ?? "Gönderilen veri geçersiz"}\n${details.map((item) => `• ${item}`).join("\n")}`;
  }

  return payload?.message ?? fallbackMessage;
}

export async function apiRequest(path, options = {}) {
  const { headers, ...restOptions } = options;
  const token = getAuthToken();

  const response = await fetch(`${API_URL}${path}`, {
    ...restOptions,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const error = new Error(formatApiError(payload, `İstek başarısız oldu (${response.status}).`));
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  if (response.status === 204) return null;

  return response.json();
}

export async function optionalApiRequest(path, fallbackValue = null, options = {}) {
  try {
    return await apiRequest(path, options);
  } catch {
    return fallbackValue;
  }
}

export function getListFromResponse(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.content)) return response.content;

  return [];
}
