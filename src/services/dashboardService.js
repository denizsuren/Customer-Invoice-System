/*
  DOSYA: dashboardService.js

  Dashboard için backend entegrasyonu burada yapılır.

  Backend'de GET /api/dashboard endpointi yok. Yeni endpoint eklemiyoruz.
  Mevcut dashboard UI'ını bozmadan şu endpointlerden veri toplanır:
  - GET /customers
  - GET /customers/{customerId}/invoices
  - GET /analysis/revenue-forecast
  - GET /analysis/upgrade-recommendations
  - GET /analysis/regional-payments
*/

import { mockDashboardData } from "../data/mockDashboardData.js";
import { normalizeBackendRegionName, normalizeCityText } from "../utils/turkeyCities.js";
import { apiRequest, isApiEnabled } from "./apiClient.js";

const MOCK_DELAY_MS = 350;
let dashboardRequestPromise = null;

function wait(ms = MOCK_DELAY_MS) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function cloneDashboardData(data) {
  return JSON.parse(JSON.stringify(data));
}

function formatMoney(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "—";
  }

  return Number(value).toLocaleString("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  });
}

/*
  DB'den ISTANBUL, sanli_urfa gibi ham gelebilen bölge adlarını
  kullanıcı dostu "Başlık Formatına" çevirir (Türkçe büyük/küçük harf kurallarıyla).
*/
function prettyCityName(value) {
  const normalized = normalizeCityText(value);

  if (normalized === "RURAL") return "Kırsal";
  if (normalized === "MID") return "Bölge merkezi";
  if (normalized === "METRO") return "Büyükşehir";

  const backendRegionName = normalizeBackendRegionName(value);
  if (backendRegionName && backendRegionName !== value) return backendRegionName;

  const cleaned = String(value ?? "")
    .replaceAll("_", " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) return "—";

  return cleaned
    .toLocaleLowerCase("tr-TR")
    .split(" ")
    .map((word) => word.charAt(0).toLocaleUpperCase("tr-TR") + word.slice(1))
    .join(" ");
}

function formatNumber(value) {
  return Number(value ?? 0).toLocaleString("tr-TR");
}

/*
  Backend DashboardResponse şuna benzer geliyor:

  {
    periodLabel,
    stats: {
      totalCustomers,
      monthlyRevenue,
      overdueInvoiceCount,
      riskyCustomerCount
    },
    revenuePoints: [
      { month/yearMonth, value/revenue }
    ],
    packageDistribution: [
      { category, count, percentage }
    ],
    activeLineCount,
    cityRevenue: [
      { city, totalRevenue/value }
    ],
    recommendations: [
      "öneri metni"
    ]
  }

  Mevcut Dashboard UI ise stats array, recommendations object array gibi alanlar bekliyor.
  Bu yüzden UI'a dokunmadan backend cevabını burada mevcut UI formatına çeviriyoruz.
*/
function normalizeDashboardResponse(response) {
  const stats = response?.stats ?? {};

  return {
    periodLabel: response?.periodLabel ?? "Backend verileri",

    stats: [
      {
        label: "TOPLAM MÜŞTERİ",
        value: formatNumber(stats.totalCustomers),
        change: "",
        tone: "default",
      },
      {
        label: "AYLIK GELİR",
        value: formatMoney(stats.monthlyRevenue),
        change: "Son fatura ayından hesaplandı",
        tone: "success",
      },
      {
        label: "GECİKEN FATURA",
        value: formatNumber(stats.overdueInvoiceCount),
        change: "Vadesi geçmiş ödenmemiş faturalar",
        tone: "warning",
      },
      {
        label: "RİSKLİ MÜŞTERİ",
        value: formatNumber(stats.riskyCustomerCount),
        change: "Son 12 ay gecikme analizinden",
        tone: "danger",
      },
    ],

    revenuePoints: (response?.revenuePoints ?? []).map((item) => ({
      month: item.month ?? item.yearMonth ?? "—",
      value: Number(item.value ?? item.revenue ?? 0),
    })),

    packageDistribution: (response?.packageDistribution ?? []).map((item, index) => {
      // "line" kenarlık rengiydi ve dilimi görünmez yapıyordu; belirgin palet kullanılıyor.
      const tones = ["accent", "blue", "teal", "purple", "orange", "rose"];

      return {
        label: item.category ?? item.label ?? "Paket",
        // Backend PackageDistributionItem adet alanını 'subscriptionCount' adıyla gönderiyor.
        value: Number(item.subscriptionCount ?? item.count ?? item.value ?? 0),
        percentage: Number(item.percentage ?? 0),
        tone: tones[index % tones.length],
      };
    }),

    // Donut merkezinde aktif abonelik değil, dashboard kartındaki toplam müşteri gösterilir.
    activeLineCount: Number(stats.totalCustomers ?? response?.activeLineCount ?? 0),

    cityRevenue: (response?.cityRevenue ?? []).map((item) => ({
      // Backend "city" alanında şehir tipi (BÜYÜKŞEHİR vb.) dönebiliyor;
      // asıl şehir adı regionName'de. Önce onu kullan.
      city: prettyCityName(item.regionName ?? item.city ?? item.cityType),
      value: Number(item.totalRevenue ?? item.value ?? 0),
      group: item.group ?? "Bölge",
    })),

    recommendations: (response?.recommendations ?? []).map((text, index) => ({
      title: text,
      description: "dashboard önerisi",
      tone: index === 1 ? "danger" : "accent",
    })),
  };
}

export async function getDashboardData() {
  if (isApiEnabled()) {
    if (!dashboardRequestPromise) {
      dashboardRequestPromise = apiRequest("/dashboard")
        .then(normalizeDashboardResponse)
        .finally(() => {
          dashboardRequestPromise = null;
        });
    }

    return dashboardRequestPromise;
  }

  await wait();
  return cloneDashboardData(mockDashboardData);
}
