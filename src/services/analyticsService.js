/*
  DOSYA: analyticsService.js

  Analizler ekranı için backend endpointleri:
  - GET /analysis/revenue-forecast
  - GET /analysis/upgrade-recommendations

  UI componentlerini değiştirmiyoruz; response'u burada mevcut kartların beklediği hale getiriyoruz.
*/

import { mockAnalyticsData } from "../data/mockAnalyticsData.js";
import { apiRequest, getListFromResponse, isApiEnabled } from "./apiClient.js";

const MOCK_DELAY_MS = 350;

function wait(ms = MOCK_DELAY_MS) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function cloneAnalyticsData(data) {
  return JSON.parse(JSON.stringify(data));
}

function formatMoney(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "—";

  return Number(value).toLocaleString("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  });
}

function normalizeRevenueForecast(response) {
  const years = getListFromResponse(response);

  const year1 = years.find((y) => y.yearOffset === 1);

  return {
    subtitle: "Ciro Tahmini",
    averageLabel: "Yıl +1 aksiyon katkısı",
    averageValue: formatMoney(year1?.reelFark),
    estimates: years.map((y) => ({
      year: y.label,
      value: formatMoney(y.reelWithRecommendationsRevenue ?? y.reelBauRevenue),
      change:
        y.yearOffset === 0
          ? "Baz"
          : `+${formatMoney(y.reelFark)}`,
      tone: y.yearOffset === 0 ? "neutral" : "success",
    })),
  };
}

function normalizeUpgradeRecommendations(response) {
  const items = getListFromResponse(response);

  const sorted = [...items].sort(
    (a, b) => Number(b.totalOverageAmount ?? 0) - Number(a.totalOverageAmount ?? 0),
  );

  const topItems = sorted.slice(0, 10);
  const remainingCount = Math.max(sorted.length - topItems.length, 0);

  return {
    subtitle: "Üst Paket Önerileri",
    totalCount: sorted.length,
    remainingCount,
    items: topItems.map((item) => ({
      ...item,
      customerId: item.customerId,
      customerName: item.customerFullName,
      overageAmount: formatMoney(item.totalOverageAmount),
      currentTier: item.currentProductName ?? `Ürün #${item.currentProductId}`,
      suggestedTier: item.suggestedAction ?? "Üst pakete geçir",
      actionLabel: item.suggestedAction ?? "Üst pakete geçir",
      reason: `${Number(item.overageInvoiceCount ?? 0)} limit aşımı faturası`,
    })),
  };
}

function normalizeRiskCategorySummary(response) {
  const items = getListFromResponse(response);

  return items.map((item) => ({
    category: item.category,
    count: Number(item.customerCount ?? item.count ?? 0),
  }));
}

const RECOMMENDATION_LABELS = {
  kampanya_teklifi: { label: "Kampanya Teklifi", tone: "success" },
  oto_odeme_teklifi: { label: "Otomatik Ödeme Teklifi", tone: "warning" },
  oto_odeme_hatirlatma: { label: "Otomatik Ödeme Hatırlatma", tone: "warning" },
  faturali_tarifeye_gecis_teklifi: { label: "Faturalı Tarifeye Geçiş", tone: "accent" },
  yuksek_tarife_teklifi: { label: "Üst Tarife Teklifi", tone: "accent" },
  ek_paket_teklifi: { label: "Ek Paket Teklifi", tone: "accent" },
  takip_arama: { label: "Takip Araması", tone: "neutral" },
  kampanya_yok: { label: "Aksiyon Yok", tone: "neutral" },
};

function getRecommendationMeta(action) {
  return RECOMMENDATION_LABELS[action] ?? { label: action, tone: "neutral" };
}

export async function getRecommendationSummary() {
  const response = await apiRequest("/analysis/recommendations/summary");
  const items = getListFromResponse(response);

  return items
    .map((item) => ({
      action: item.recommendAction,
      count: item.customerCount,
      ...getRecommendationMeta(item.recommendAction),
    }))
    .sort((a, b) => b.count - a.count);
}

export async function getRiskCategorySummary() {
  if (isApiEnabled()) {
    const response = await apiRequest("/analysis/risk-categories/summary");
    return normalizeRiskCategorySummary(response);
  }

  await wait();

  return [
    { category: "guvenilir", count: 6200 },
    { category: "normal", count: 2800 },
    { category: "riskli", count: 1000 },
  ];
}

export async function getRecommendationList(action, page = 0, size = 10) {
  const response = await apiRequest(
    `/analysis/recommendations?action=${encodeURIComponent(action)}&page=${page}&size=${size}`,
  );
  const items = getListFromResponse(response);

  return {
    items: items.map((item) => ({
      customerId: item.customerId,
      customerName: item.customerName,
      riskScore: item.riskScore,
      behaviorCategory: item.behaviorCategory,
    })),
    totalElements: response?.totalElements ?? items.length,
    totalPages: response?.totalPages ?? 1,
    page: response?.number ?? page,
  };
}

export async function getAnalyticsData() {
  if (isApiEnabled()) {
    const [revenueForecast, upgradeRecommendations] = await Promise.all([
      apiRequest("/analysis/revenue-forecast"),
      apiRequest("/analysis/upgrade-recommendations"),
    ]);

    return {
      revenueForecast: normalizeRevenueForecast(revenueForecast),
      overage: normalizeUpgradeRecommendations(upgradeRecommendations),
    };
  }

  await wait();
  return cloneAnalyticsData(mockAnalyticsData);
}
