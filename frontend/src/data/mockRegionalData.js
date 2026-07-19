/*
  DOSYA: mockRegionalData.js

  Backend hazır değilken Bölgesel ekranında gösterilecek geçici veriler burada tutulur.
  Gerçek API bağlandığında componentler bu dosyayı doğrudan kullanmaz;
  regionalService.js, VITE_API_URL boşsa bu veriyi döndürür.

  Figma prototipindeki "Bölgesel" sayfasının grafik verilerini temsil eder.
*/

export const mockRegionalData = {
  // Sol kart: bölge/şehir bazlı ciro (bin ₺).
  cityRevenue: {
    subtitle: "Bölge / Şehir Toplam Ciroları (Bin ₺)",
    unit: "Bin ₺",
    items: [
      { label: "Marmara (İstanbul)", value: 412 },
      { label: "İç Anadolu (Ankara)", value: 296 },
      { label: "Ege (İzmir)", value: 231 },
      { label: "Akdeniz (Antalya)", value: 185 },
      { label: "Karadeniz (Trabzon)", value: 140 },
      { label: "Güneydoğu (G.Antep)", value: 95 },
    ],
  },

  // Sağ kart: mobil ödeme uygulaması işlem sayıları.
  mobilePayments: {
    subtitle: "MOBILE_APP İşlem Sayıları",
    unit: "İşlem",
    items: [
      { label: "İstanbul", value: 8450 },
      { label: "Ankara", value: 5120 },
      { label: "İzmir", value: 4800 },
      { label: "Bursa", value: 3200 },
      { label: "Antalya", value: 2750 },
      { label: "Adana", value: 1800 },
    ],
  },
};
