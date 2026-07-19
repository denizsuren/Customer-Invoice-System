# 🎨 PiA Telekom — Frontend (React Yönetim Paneli)

Müşteri & fatura yönetim sisteminin arayüzü. React 19 + Vite ile geliştirilen, component tabanlı bir admin paneli. Backend hazır olmadığında **mock data modu** ile bağımsız çalışabilir — bu sayede frontend ve backend ekipleri paralel geliştirme yapabilmiştir.

## 🛠 Teknolojiler

- **React 19** + **Vite 8** — hızlı geliştirme ve build
- **React Router 7** — sayfa yönlendirme
- **ESLint + Prettier** — kod kalitesi ve tutarlı format
- Harici UI kütüphanesi kullanılmadan **özel component seti** (Modal, Badge, Pagination, FormField, grafik bileşenleri...)

## 📁 Proje Yapısı

```
src/
├── pages/         → Dashboard, Customers, Invoices, Analytics, Regional, Settings, Login
├── components/
│   ├── ui/        → Yeniden kullanılabilir temel bileşenler (Button, Modal, Badge, ...)
│   ├── customers/ → Müşteri tablo, filtre ve modal bileşenleri
│   ├── invoices/  → Fatura form ve tablo bileşenleri
│   ├── charts/    → Gelir, paket dağılımı, şehir bazlı grafikler
│   ├── analytics/ → Risk, tahmin ve öneri kartları
│   ├── regional/  → Türkiye haritası (TurkeyMap) görselleştirmesi
│   └── layout/    → Sidebar, Topbar, ikonlar
├── services/      → API istemcisi + servis katmanı (auth, customer, invoice, ...)
├── hooks/         → Özel hook'lar (useInvoices, ...)
├── context/       → Global durum yönetimi
├── i18n/          → Çok dillilik altyapısı
└── data/          → Mock veri kaynakları
```

Servis katmanı, `VITE_API_URL` değerine göre **gerçek API** veya **mock veri** arasında şeffaf geçiş yapar; sayfalar hangi kaynağın kullanıldığını bilmez.

## 🚀 Kurulum & Çalıştırma

```bash
npm install
cp .env.example .env
npm run dev        # → http://localhost:5173
```

### Ortam Değişkenleri (`.env`)

| Değer | Davranış |
|---|---|
| `VITE_API_URL=/api` | **Önerilen.** İstekler Vite proxy'sine gider (`vite.config.js` → `localhost:8080`). Aynı origin'den çıktığı için **CORS sorunu yaşanmaz.** |
| `VITE_API_URL=http://localhost:8080/api` | Backend'e doğrudan istek (cross-origin; backend'deki CORS yapılandırması gerekir) |
| `VITE_API_URL=` (boş) | **Mock modu** — backend olmadan örnek verilerle çalışır |

> Backend, veritabanı olarak Supabase'de barındırılan PostgreSQL'i kullanır; frontend'in Supabase ile doğrudan bir bağlantısı yoktur — tüm veri erişimi REST API üzerinden yapılır.

## 🧹 Kalite Kontrolleri

```bash
npm run lint           # ESLint
npm run format:check   # Prettier kontrolü
npm run format         # Otomatik formatlama
npm run build          # Production build
npm run preview        # Build önizleme
```

## 🔐 Oturum Akışı

Login sayfasından alınan oturum token'ı, servis katmanındaki `apiClient` tarafından her isteğe `Authorization: Bearer <token>` başlığı olarak eklenir. Token backend'de veritabanı üzerinde doğrulanır.
