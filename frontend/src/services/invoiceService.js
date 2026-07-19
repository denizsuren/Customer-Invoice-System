/*
  DOSYA: invoiceService.js

  Faturalar sayfası için backend entegrasyonu burada yapılır.

  Backend'de global GET /api/invoices endpointi yok.
  Bu yüzden mevcut InvoicesPage UI'ını bozmadan:
  1. /customers ile müşteriler alınır.
  2. Her müşteri için /customers/{customerId}/invoices çağrılır.
  3. Faturalar mevcut InvoiceTable'ın beklediği alanlara çevrilir.
*/

import { mockInvoices } from "../data/mockInvoiceData";
import {
  apiRequest,
  getListFromResponse,
  isApiEnabled,
  optionalApiRequest,
} from "./apiClient";

const MOCK_DELAY_MS = 350;

function wait(ms = MOCK_DELAY_MS) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function cloneInvoices(invoices) {
  return invoices.map((invoice) => ({ ...invoice }));
}

function formatMoney(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "—";

  return Number(value).toLocaleString("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  });
}

function formatDate(value) {
  if (!value) return "—";

  return new Date(value).toLocaleDateString("tr-TR");
}

function getCustomerName(customer) {
  return [customer?.name, customer?.surname].filter(Boolean).join(" ").trim() || "—";
}

function normalizePaymentStatus(status, dueDate, dueAmount) {
  const value = String(status ?? "").toUpperCase();
  const hasDebt = Number(dueAmount ?? 0) > 0;
  const isOverdue = dueDate ? new Date(dueDate) < new Date() : false;

  if (value === "PAID" || value.includes("ÖDENDİ")) return "Ödendi";
  if (value === "OVERDUE" || value.includes("LATE") || (hasDebt && isOverdue)) {
    return "Gecikmiş Ödeme";
  }
  if (value === "UNPAID" || value.includes("PENDING") || hasDebt) return "Bekliyor";

  return status || "Bekliyor";
}

function getPaymentStatusTone(statusLabel) {
  if (statusLabel === "Ödendi") return "success";
  if (statusLabel === "Gecikmiş Ödeme") return "danger";

  return "warning";
}

/*
  ESKİ YAKLAŞIM (kaldırıldı): Her fatura için /invoices/{id}/collection-actions
  ayrı ayrı çağrılıyordu. Fatura sayısı kadar ekstra HTTP isteği demekti ve
  backend bağlantı havuzunu tüketip 500'lere yol açan yükün büyük parçasıydı.

  YENİ YAKLAŞIM: Liste ekranında aksiyon önerisi borç durumundan lokal hesaplanır.
  Gerçek tahsilat aksiyon geçmişi gerektiğinde (ör. fatura detayı) aşağıdaki
  getInvoiceCollectionActions(invoiceId) ile tek fatura için çekilir.
*/
function getCollectionActionText(invoice) {
  if (Number(invoice.dueAmount ?? 0) > 0) return "Tahsilat aksiyonu gerekli";
  return "—";
}

export async function getInvoiceCollectionActions(invoiceId) {
  if (!invoiceId) return [];

  const response = await optionalApiRequest(`/invoices/${invoiceId}/collection-actions`, []);
  const actions = getListFromResponse(response);
  const latestFirst = [...actions].sort((first, second) => {
    const firstDate = new Date(first.actionDate ?? 0).getTime();
    const secondDate = new Date(second.actionDate ?? 0).getTime();
    return secondDate - firstDate;
  });

  return latestFirst;
}

function normalizeInvoice(invoice, customer) {
  const status = normalizePaymentStatus(invoice.paymentStatus, invoice.dueDate, invoice.dueAmount);
  const actionRecommendation = getCollectionActionText(invoice);

  return {
    ...invoice,

    // Mevcut InvoiceTable'ın kullandığı alanlar.
    id: `INV-${invoice.invoiceId}`,
    // Backend InvoiceResponse zaten customerName döndürüyor; müşteri objesi opsiyonel.
    customerName: invoice.customerName ?? getCustomerName(customer),
    invoiceDate: formatDate(invoice.invoiceDate),
    dueDate: formatDate(invoice.dueDate),
    amount: formatMoney(invoice.invoiceAmount),
    status,
    statusTone: getPaymentStatusTone(status),
    actionRecommendation,

    // Backend alanları korunuyor; UI'a sonra istersek ekleriz.
    invoiceId: invoice.invoiceId,
    customerId: invoice.customerId,
    product: invoice.product,
    productName: invoice.product?.name ?? "",
    paymentChannel: invoice.paymentChannel,
    invoiceAmount: invoice.invoiceAmount,
    dueAmount: invoice.dueAmount,
    overageAmount: invoice.overageAmount,
    paymentDate: invoice.paymentDate,
    paymentStatus: invoice.paymentStatus,

    // Form düzenleme için ham (ISO) tarihler — <input type="date"> bunu bekliyor.
    rawInvoiceDate: invoice.invoiceDate,
    rawDueDate: invoice.dueDate,
    rawPaymentDate: invoice.paymentDate,
  };
}

/*
  Faturalar sayfasının üst özet kartları. Backend tek endpoint'te 4 kartın
  verisini döner (GET /invoices/summary); hata durumunda null döner ve sayfa
  kartları çizmeden çalışmaya devam eder.
*/
export async function getInvoiceSummary() {
  if (!isApiEnabled()) return null;
  return optionalApiRequest("/invoices/summary", null);
}

export async function getInvoices(page = 0, size = 20, options = {}) {
  const { query = "", status = "" } = options;

  if (isApiEnabled()) {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("size", String(size));
    if (query.trim()) params.set("query", query.trim());
    if (status) params.set("status", status);

    const response = await apiRequest(`/invoices?${params.toString()}`);
    const invoices = getListFromResponse(response);

    return {
      items: invoices.map((invoice) => normalizeInvoice(invoice, null)),
      totalElements: response?.totalElements ?? invoices.length,
      totalPages: response?.totalPages ?? 1,
      page: response?.number ?? page,
    };
  }

  await wait();
  const items = cloneInvoices(mockInvoices);
  return { items, totalElements: items.length, totalPages: 1, page: 0 };
}
function buildInvoiceRequest(input) {
  return {
    productId: input.productId ? Number(input.productId) : null,
    paymentChannel: input.paymentChannel || null,
    invoiceAmount: Number(input.invoiceAmount) || 0,
    dueAmount: Number(input.dueAmount) || 0,
    overageAmount: Number(input.overageAmount) || 0,
    invoiceDate: input.invoiceDate,
    dueDate: input.dueDate,
    paymentDate: input.paymentDate || null,
  };
}

export async function createInvoice(customerId, input) {
  if (isApiEnabled()) {
    const payload = buildInvoiceRequest(input);
    const created = await apiRequest(`/customers/${customerId}/invoices`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return normalizeInvoice(created, null);
  }

  await wait();
  throw new Error("Mock modda fatura ekleme desteklenmiyor.");
}

export async function updateInvoice(customerId, invoiceId, input) {
  if (isApiEnabled()) {
    const payload = buildInvoiceRequest(input);
    const updated = await apiRequest(`/customers/${customerId}/invoices/${invoiceId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    return normalizeInvoice(updated, null);
  }

  await wait();
  throw new Error("Mock modda fatura güncelleme desteklenmiyor.");
}

export async function deleteInvoice(customerId, invoiceId) {
  if (isApiEnabled()) {
    await apiRequest(`/customers/${customerId}/invoices/${invoiceId}`, { method: "DELETE" });
    return invoiceId;
  }

  await wait();
  throw new Error("Mock modda fatura silme desteklenmiyor.");
}
