/*
  DOSYA: regionalService.js

  Bölgesel ekranı için backend endpointi:
  - GET /analysis/regional-payments

  UI componentlerini değiştirmiyoruz. Backend'deki tek bölgesel analiz listesini
  mevcut iki grafik yapısına burada çeviriyoruz.
*/

import { mockRegionalData } from "../data/mockRegionalData.js";
import { normalizeBackendRegionName, normalizeCityText } from "../utils/turkeyCities.js";
import { apiRequest, getListFromResponse, isApiEnabled } from "./apiClient.js";

const MOCK_DELAY_MS = 350;

function wait(ms = MOCK_DELAY_MS) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function cloneRegionalData(data) {
  return JSON.parse(JSON.stringify(data));
}

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

function toThousands(value) {
  return Math.round(Number(value ?? 0) / 1000);
}

function normalizeRegionalData(response) {
  const items = getListFromResponse(response);

  return {
    // Türkiye haritası bileşeni ham bölge kayıtlarını kullanır (regionName,
    // totalRevenue, totalInvoiceCount, averageInvoiceAmount, overdueRatePercentage).
    mapItems: items,

    cityRevenue: {
      subtitle: "Bölgelere göre toplam gelir",
      unit: "Bin ₺",
      items: items.map((item) => ({
        ...item,
        label: prettyCityName(item.regionName || item.city || item.name),
        value: toThousands(item.totalRevenue),
      })),
    },

    mobilePayments: {
      subtitle: "Bölgelere göre fatura adedi",
      unit: "Fatura",
      items: items.map((item) => ({
        ...item,
        label: prettyCityName(item.regionName || item.city || item.name),
        value: Number(item.totalInvoiceCount ?? 0),
      })),
    },
  };
}

export async function getRegionalData() {
  if (isApiEnabled()) {
    const response = await apiRequest("/analysis/regional-payments");
    return normalizeRegionalData(response);
  }

  await wait();
  return cloneRegionalData(mockRegionalData);
}
