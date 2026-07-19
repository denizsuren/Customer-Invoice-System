/*
  DOSYA: mockAnalyticsData.js

  Backend hazır değilken Analizler ekranında gösterilecek geçici veriler burada tutulur.
  Gerçek API bağlandığında componentler bu dosyayı doğrudan kullanmaz;
  analyticsService.js, VITE_API_URL boşsa bu veriyi döndürür.

  Figma prototipindeki "Analizler" sayfasının (Senaryo 10 / Senaryo 11) birebir karşılığıdır.
*/

export const mockAnalyticsData = {
  // Sol kart: ciro tahmini.
  revenueForecast: {
    subtitle: "Son 5 Yıla Göre Ciro Tahmini (Senaryo 11)",
    averageLabel: "Yıllık Ortalama (2021-2025)",
    averageValue: "14.800.000 ₺",
    estimates: [
      { year: "2026 Tahmini", value: "15.2M ₺", change: "▲ %2.7", tone: "success" },
      { year: "2027 Tahmini", value: "16.5M ₺", change: "▲ %8.5", tone: "success" },
    ],
  },

  // Sağ kart: paket aşımı önerileri.
  overage: {
    subtitle: "Limit Aşan Müşteriler (Overage > 0)",
    items: [
      { customerName: "Elif Şahin", overageAmount: "120 ₺", currentTier: "Tier 2", suggestedTier: "Tier 3" },
      { customerName: "Mehmet Kaya", overageAmount: "85 ₺", currentTier: "Tier 3", suggestedTier: "Tier 4" },
      { customerName: "Ali Yılmaz", overageAmount: "40 ₺", currentTier: "Tier 2", suggestedTier: "Tier 3" },
      { customerName: "Burcu Çelik", overageAmount: "210 ₺", currentTier: "Tier 4", suggestedTier: "Tier 5" },
      { customerName: "Deniz Aksoy", overageAmount: "65 ₺", currentTier: "Tier 1", suggestedTier: "Tier 2" },
    ],
  },
};
