import { initialCustomers } from "../data/mockData.js";
import {
  getRegionLookupNamesForCity,
  normalizeBackendRegionName,
  normalizeCityText,
} from "../utils/turkeyCities.js";
import { apiRequest, getListFromResponse, isApiEnabled, optionalApiRequest } from "./apiClient.js";

const MOCK_DELAY_MS = 350;

let mockCustomers = initialCustomers.map((customer) => ({ ...customer }));
let cachedRegions = null;

function wait(ms = MOCK_DELAY_MS) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function cloneCustomer(customer) {
  return customer ? { ...customer } : customer;
}

function formatMoney(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "—";

  return Number(value).toLocaleString("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  });
}

function normalizeText(value) {
  try {
    if (value === null || value === undefined) {
      return "";
    }

    return String(value)
      .trim()
      .toLocaleLowerCase("tr-TR")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // İ üstündeki görünmeyen nokta/aksanları temizler
      .replace(/ı/g, "i")              // Türkçe noktasız ı'yı i yapar
      .replace(/[\u200B-\u200D\uFEFF]/g, "") // görünmeyen boşluk karakterlerini temizler
      .replace(/\s+/g, " ");           // fazla boşlukları tek boşluğa indirir
  } catch {
    return "";
  }
}

function getCustomerId(customer) {
  return customer.customerId ?? customer.id;
}

function getFullName(customer) {
  return [customer?.name, customer?.surname].filter(Boolean).join(" ").trim();
}

function getAgeGroup(customer) {
  return customer?.ageGroup ?? customer?.ageRange ?? customer?.age_group ?? "";
}

function parseBirthDate(value) {
  const [year, month, day] = String(value ?? "")
    .split("-")
    .map(Number);

  if (!year || !month || !day) return null;

  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }

  return date;
}

function calculateAge(value) {
  const birthDate = parseBirthDate(value);
  if (!birthDate) return null;

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const birthdayPassedThisYear =
    today.getMonth() > birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());

  if (!birthdayPassedThisYear) age -= 1;

  return age;
}

function getAgeGroupFromBirthDate(value) {
  const age = calculateAge(value);

  if (age === null || age < 18) return "";
  if (age <= 25) return "18-25";
  if (age <= 35) return "26-35";
  if (age <= 45) return "36-45";
  if (age <= 55) return "46-55";

  return "56+";
}

function normalizeRiskTag(riskTag) {
  /*
    KRİTİK: Backend Türkçe karakterli değerler gönderir ("RİSKLİ", "AKTİF",
    "PASİF"). Noktalı İ (U+0130), ASCII I ile AYNI DEĞİLDİR; bu yüzden
    "RİSKLİ".includes("RISK") false döner ve eski kod HER müşteriyi
    "Güvenilir" gösteriyordu. Önce Türkçe harfler ASCII'ye katlanır,
    eşleşme ondan sonra yapılır.
  */
  const value = String(riskTag ?? "")
    .toLocaleUpperCase("tr-TR")
    .replaceAll("İ", "I")
    .replaceAll("Ü", "U")
    .replaceAll("Ö", "O")
    .replaceAll("Ş", "S")
    .replaceAll("Ç", "C")
    .replaceAll("Ğ", "G");

  if (value.includes("RISK") || value.includes("HIGH")) return "Riskli";
  if (value.includes("AKTIF") || value.includes("ACTIVE")) return "Aktif";
  if (value.includes("PASIF") || value.includes("PASSIVE")) return "Pasif";
  if (value.includes("NORMAL") || value.includes("ORTA")) return "Normal";

  return "Güvenilir";
}

function normalizeLineType(product, customer = {}) {
  const rawValue =
    product?.subscriptionType ??
    product?.type ??
    product?.category ??
    product?.name ??
    customer?.subscriptionType ??
    customer?.lineType ??
    customer?.productType ??
    customer?.packageType ??
    customer?.packageName ??
    "";

  const value = normalizeCityText(rawValue);

  if (
    value.includes("PREPAID") ||
    value.includes("PRE PAID") ||
    value.includes("FATURASIZ") ||
    value.includes("ON ODEMELI")
  ) {
    return "Faturasız";
  }

  return "Faturalı";
}

function normalizePaymentStatus(status, dueDate, dueAmount) {
  const value = String(status ?? "").toUpperCase();
  const hasDebt = Number(dueAmount ?? 0) > 0;
  const isOverdue = dueDate ? new Date(dueDate) < new Date() : false;

  if (value.includes("PAID") || value.includes("ÖDENDİ")) return "Ödendi";
  if (value.includes("OVERDUE") || value.includes("LATE") || (hasDebt && isOverdue)) {
    return "Gecikmiş Ödeme";
  }
  if (value.includes("PENDING") || value.includes("UNPAID") || hasDebt) return "Bekliyor";

  return status || "Yeni kayıt";
}

function getStatusTone(statusLabel) {
  if (statusLabel === "Ödendi") return "success";
  if (statusLabel === "Gecikmiş Ödeme") return "danger";
  if (statusLabel === "Yeni kayıt") return "success";

  return "warning";
}

function getLatestInvoice(invoices) {
  return [...invoices].sort((first, second) => {
    const firstDate = new Date(first.invoiceDate ?? first.dueDate ?? 0).getTime();
    const secondDate = new Date(second.invoiceDate ?? second.dueDate ?? 0).getTime();

    return secondDate - firstDate;
  })[0];
}

/*
  ESKİ YAKLAŞIM (kaldırıldı): Liste ekranında HER müşteri için
  /customers/{id}/invoices ve /subscriptions/by-customer/{id} çağrılıyordu.
  100 müşteri = 201 HTTP isteği; backend'in 2 bağlantılık havuzu ve uzak
  Supabase gecikmesiyle birleşince istekler timeout'a düşüp 500 dönüyordu.

  YENİ YAKLAŞIM: Tüm faturalar backend'in zaten var olan GET /invoices
  endpoint'inden TEK istekle çekilir, müşteriye göre burada gruplanır.
  Subscription detayı liste için gerekli değil; müşteri detayı açıldığında
  getCustomerDetail(id) ile tek müşteri için çekilir.
*/
async function getAllInvoicesGroupedByCustomer() {
  const response = await optionalApiRequest("/invoices?page=0&size=2000", null);
  const invoices = getListFromResponse(response);

  const grouped = new Map();
  invoices.forEach((invoice) => {
    const key = String(invoice.customerId ?? "");
    if (!key) return;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(invoice);
  });

  return grouped;
}
async function getAllSubscriptionSummariesGroupedByCustomer() {
  const response = await optionalApiRequest("/subscriptions/summary", []);
  const summaries = getListFromResponse(response);

  const map = new Map();
  summaries.forEach((s) => {
    map.set(String(s.customerId), s);
  });

  return map;
}

/* Detay ekranı için: tek müşterinin faturaları + aboneliği (2 istek, sadece o an). */
export async function getCustomerExtraData(customer) {
  const customerId = getCustomerId(customer);

  if (!customerId) {
    return { invoices: [], subscription: null, recharges: [] };
  }

  const [invoiceResponse, subscription, rechargeResponse] = await Promise.all([
    optionalApiRequest(`/customers/${customerId}/invoices?page=0&size=6&sort=invoiceDate,desc`, []),
    optionalApiRequest(`/subscriptions/by-customer/${customerId}`, null),
    optionalApiRequest(`/customers/${customerId}/recharges?page=0&size=10`, []),
  ]);

  return {
    invoices: getListFromResponse(invoiceResponse),
    subscription,
    recharges: getListFromResponse(rechargeResponse),
  };
}

function normalizeCustomer(customer, extraData = {}) {
  const customerId = getCustomerId(customer);
  const latestInvoice = getLatestInvoice(extraData.invoices ?? []);
  const subscriptionProduct = extraData.subscription?.product;
  const summaryProduct = extraData.subscriptionSummary
    ? {
        subscriptionType: extraData.subscriptionSummary.subscriptionType,
        name: extraData.subscriptionSummary.productName,
        tierLevel: extraData.subscriptionSummary.tierLevel,
      }
    : null;
  const responseProduct = customer.product ?? customer.activeProduct;
  const invoiceProduct = latestInvoice?.product;
  const product = subscriptionProduct ?? summaryProduct ?? responseProduct ?? invoiceProduct;
  const status = latestInvoice
    ? normalizePaymentStatus(
        latestInvoice.paymentStatus,
        latestInvoice.dueDate,
        latestInvoice.dueAmount,
      )
    : "Yeni kayıt";

  return {
    ...customer,

    // Mevcut CustomerTable ve filtrelerin beklediği alanlar.
    id: String(customerId),
    name: getFullName(customer) || customer.name || "İsimsiz müşteri",
    phone: customer.phone ?? "—",
    email: customer.email ?? "—",
    lineType: normalizeLineType(product, customer),
    city: normalizeBackendRegionName(
      customer.region?.name ?? customer.region?.city ?? customer.region?.cityType ?? customer.city,
    ),
    tag: normalizeRiskTag(customer.riskTag),
    lastInvoice: latestInvoice ? formatMoney(latestInvoice.invoiceAmount) : "—",
    status,
    statusTone: getStatusTone(status),
    packageName: product?.name ?? customer.packageName ?? "—",

    // Backend alanları objenin içinde korunuyor; UI'a sonra istersek ekleriz.
    customerId,
    firstName: customer.name ?? "",
    surname: customer.surname ?? "",
    birthDate: customer.birthDate ?? customer.birthdate ?? "",
    address: customer.address ?? "",
    regionId: customer.region?.regionId ?? customer.regionId ?? "",
    productId: product?.productId ?? customer.productId ?? "",
    ageGroup: getAgeGroup(customer),
    paymentChannelPreference: customer.paymentChannelPreference ?? "",
    hasAutopay: Boolean(customer.hasAutopay),
    riskTag: customer.riskTag ?? "",
    invoices: extraData.invoices ?? [],
    subscription: extraData.subscription ?? null,
  };
}

function splitFullName(fullName = "") {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);

  return {
    name: parts[0] ?? "",
    surname: parts.slice(1).join(" ") || "Belirtilmedi",
  };
}

async function getRegions() {
  if (!cachedRegions) {
    cachedRegions = apiRequest("/regions").then(getListFromResponse);
  }

  return cachedRegions;
}

function findRegionIdByCity(regions, city) {
  if (!city) return null;

  const lookupNames = getRegionLookupNamesForCity(city);
  const normalizedLookupNames = lookupNames.map((name) => normalizeText(name));

  const matchedRegion = regions.find((region) => {
    const regionName = normalizeText(region.name);
    const regionCity = normalizeText(region.city);
    const regionCityType = normalizeText(region.cityType);

    return normalizedLookupNames.some(
      (lookupName) =>
        regionName === lookupName || regionCity === lookupName || regionCityType === lookupName,
    );
  });

  return matchedRegion?.regionId ? Number(matchedRegion.regionId) : null;
}

async function resolveRegionId(input) {
  const regions = await getRegions();

  const matchedByCity = findRegionIdByCity(regions, input.city);
  if (matchedByCity) return matchedByCity;

  if (input.regionId) return Number(input.regionId);
  if (regions[0]?.regionId) return Number(regions[0].regionId);

  throw new Error("Müşteri kaydı için kullanılacak bölge bulunamadı.");
}

async function resolveCityToRegionId(city) {
  if (!city || city === "Tümü") return null;
  const regions = await getRegions();
  return findRegionIdByCity(regions, city);
}

async function buildCustomerRequest(input) {
  const nameParts = splitFullName(input.name);

  return {
    name: input.firstName || nameParts.name,
    surname: input.surname || nameParts.surname,
    birthDate: input.birthDate || null,
    address: input.address || "",
    email: input.email || "",
    phone: input.phone || "",
    regionId: await resolveRegionId(input),
    ageGroup: input.ageGroup || getAgeGroupFromBirthDate(input.birthDate),
    paymentChannelPreference: input.paymentChannelPreference || "",
    hasAutopay: Boolean(input.hasAutopay),
  };
}

function buildSubscriptionRequest(customerId, input) {
  if (!input.productId) return null;

  return {
    customerId: Number(customerId),
    productId: Number(input.productId),
    startDate: input.subscriptionStartDate || new Date().toISOString().slice(0, 10),
    status: input.subscriptionStatus || "ACTIVE",
  };
}

async function createCustomerSubscription(customerId, input) {
  const payload = buildSubscriptionRequest(customerId, input);
  if (!payload) return null;

  return apiRequest("/subscriptions", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

async function updateCustomerSubscription(customerId, input) {
  const payload = buildSubscriptionRequest(customerId, input);
  if (!payload) return null;

  return apiRequest(`/subscriptions/by-customer/${customerId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

function nextMockId() {
  const ids = mockCustomers.map((customer) => Number(customer.id)).filter(Number.isFinite);
  return String((ids.length ? Math.max(...ids) : 1000) + 1);
}

export async function getCustomers(options = {}) {
  const {
    page = 0,
    size = 20,
    search = "",
    lineType = "Tümü",
    city = "Tümü",
    delay = "Tümü",
    tag = "Tümü",
  } = options;

  if (isApiEnabled()) {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("size", String(size));

    if (search.trim()) params.set("name", search.trim());
    if (lineType === "Faturalı") params.set("subscriptionType", "faturali");
    if (lineType === "Faturasız") params.set("subscriptionType", "faturasiz");
    if (delay === "3+ kez") params.set("minOverdueCount", "3");

    /*
      Etiket, customer_risk_analysis.behavior_category'ye göre SUNUCUDA
      filtrelenir (recalculate-stats + recalculate-risk çalıştırılmış olmalı).
    */
    const tagToCategory = { "Riskli": "riskli", "Güvenilir": "guvenli", "Aktif": "aktif", "Pasif": "pasif", "Normal": "orta_risk" };
    if (tagToCategory[tag]) params.set("riskCategory", tagToCategory[tag]);

    const regionId = await resolveCityToRegionId(city);
    if (regionId) params.set("regionId", String(regionId));

    const [customerResponse, invoicesByCustomer, subscriptionsByCustomer] = await Promise.all([
      apiRequest(`/customers/search?${params.toString()}`),
      getAllInvoicesGroupedByCustomer(),
      getAllSubscriptionSummariesGroupedByCustomer(),
    ]);

    const customers = getListFromResponse(customerResponse);

    return {
      items: customers.map((customer) => {
        const invoices = invoicesByCustomer.get(String(getCustomerId(customer))) ?? [];
        const subscriptionSummary =
          subscriptionsByCustomer.get(String(getCustomerId(customer))) ?? null;
        return normalizeCustomer(customer, { invoices, subscription: null, subscriptionSummary });
      }),
      totalElements: customerResponse?.totalElements ?? customers.length,
      totalPages: customerResponse?.totalPages ?? 1,
      page: customerResponse?.number ?? page,
    };
  }

  await wait();
  const items = mockCustomers.map(cloneCustomer);
  return { items, totalElements: items.length, totalPages: 1, page: 0 };
}

export async function createCustomer(input) {
  if (isApiEnabled()) {
    const payload = await buildCustomerRequest(input);

    const createdCustomer = await apiRequest("/customers", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    const subscription = await createCustomerSubscription(createdCustomer.customerId, input);

    return normalizeCustomer(createdCustomer, { subscription });
  }

  await wait();
  const customer = {
    ...input,
    id: nextMockId(),
    tag: input.tag ?? (input.lineType === "Faturasız" ? "Aktif" : "Güvenilir"),
    lastInvoice: input.lastInvoice ?? "—",
    status: input.status ?? "Yeni kayıt",
    statusTone: input.statusTone ?? "success",
    ageGroup: input.ageGroup || getAgeGroupFromBirthDate(input.birthDate),
  };

  mockCustomers = [customer, ...mockCustomers];
  return cloneCustomer(customer);
}

export async function updateCustomer(id, input) {
  if (isApiEnabled()) {
    const payload = await buildCustomerRequest(input);

    const updatedCustomer = await apiRequest(`/customers/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });

    const subscription = await updateCustomerSubscription(id, input);

    return normalizeCustomer(updatedCustomer, { subscription });
  }

  await wait();
  const current = mockCustomers.find((customer) => customer.id === id);
  if (!current) throw new Error("Güncellenecek müşteri bulunamadı.");

  const updatedCustomer = {
    ...current,
    ...input,
    id: current.id,
    phone: current.phone,
    ageGroup: input.ageGroup || getAgeGroupFromBirthDate(input.birthDate),
  };

  mockCustomers = mockCustomers.map((customer) =>
    customer.id === id ? updatedCustomer : customer,
  );

  return cloneCustomer(updatedCustomer);
}

export async function deleteCustomer(id) {
  if (isApiEnabled()) {
    await apiRequest(`/customers/${id}`, { method: "DELETE" });
    return id;
  }

  await wait();
  const exists = mockCustomers.some((customer) => customer.id === id);
  if (!exists) throw new Error("Silinecek müşteri bulunamadı.");

  mockCustomers = mockCustomers.filter((customer) => customer.id !== id);
  return id;
}
