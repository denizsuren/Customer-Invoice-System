/*
  DOSYA: mockDashboardData.js

  Backend hazır değilken dashboard ekranında gösterilecek geçici veriler burada tutulur.
  Gerçek API bağlandığında componentler bu dosyayı doğrudan kullanmaz;
  dashboardService.js, VITE_API_URL boşsa bu veriyi döndürür.

  Backend response'unun da mümkün olduğunca bu objeyle aynı yapıda olması beklenir.
*/

export const mockDashboardData = {
  // Sayfa başlığının altında görünen dönem açıklaması.
  periodLabel: "Genel bakış · Temmuz 2026",

  // Dashboard'un üstündeki dört özet kart.
  stats: [
    {
      label: "TOPLAM MÜŞTERİ",
      value: "2.418",
      change: "▲ %4,2 geçen aya göre",
      tone: "default",
    },
    {
      label: "AYLIK GELİR",
      value: "1,24M ₺",
      change: "▲ %6,8 geçen aya göre",
      tone: "default",
    },
    {
      label: "GECİKEN FATURA",
      value: "134",
      change: "▲ %12 geçen aya göre",
      tone: "warning",
    },
    {
      label: "RİSKLİ MÜŞTERİ",
      value: "57",
      change: "▲ 9 yeni etiket",
      tone: "danger",
    },
  ],

  // Çizgi grafik verisi. value alanı bin TL cinsindedir.
  revenuePoints: [
    { month: "Şub", value: 920 },
    { month: "Mar", value: 970 },
    { month: "Nis", value: 940 },
    { month: "May", value: 1080 },
    { month: "Haz", value: 1140 },
    { month: "Tem", value: 1240 },
  ],

  // Donut grafik. Değerler yüzde veya adet olabilir; component oranı kendi hesaplar.
  packageDistribution: [
    { label: "İnternet ağırlıklı", value: 45, tone: "accent" },
    { label: "Konuşma ağırlıklı", value: 30, tone: "blue" },
    { label: "Karma", value: 15, tone: "gray" },
    { label: "Faturasız", value: 10, tone: "line" },
  ],

  // Donut grafiğin ortasında gösterilen toplam aktif hat sayısı.
  activeLineCount: 2418,

  // Sütun grafik verisi. value alanı bin TL cinsindedir.
  cityRevenue: [
    { city: "İstanbul", value: 412, group: "Büyükşehir" },
    { city: "Ankara", value: 296, group: "Büyükşehir" },
    { city: "İzmir", value: 231, group: "Büyükşehir" },
    { city: "Antalya", value: 148, group: "Bölge merkezi" },
    { city: "Trabzon", value: 97, group: "Bölge merkezi" },
    { city: "Diğer", value: 62, group: "Bölge merkezi" },
  ],

  // Öneri motoru kartı ve modalında gösterilecek çıkarımlar.
  recommendations: [
    {
      title: "41 müşteri faturalıya geçişe uygun",
      description: "Son 3 ay düzenli yükleme yapan faturasız müşteriler.",
      tone: "accent",
    },
    {
      title: "78 müşteri üst pakete aday",
      description: "Paket limitini en az iki ay üst üste aşan müşteriler.",
      tone: "blue",
    },
    {
      title: "Akdeniz'de konuşma talebi yüksek",
      description: "Bölge ortalamasının %18 üzerinde kullanım gözlendi.",
      tone: "warning",
    },
    {
      title: "134 geciken fatura için teşvik",
      description: "Otomatik ödeme indirimi dönüşümü artırabilir.",
      tone: "danger",
    },
  ],
};
