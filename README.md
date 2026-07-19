# PiA Admin — React Frontend

Figma tasarımındaki yönetim panelinin component tabanlı React karşılığıdır. Backend URL'si verilmediğinde uygulama otomatik olarak mock müşteri servisini kullanır.

## Çalıştırma

```bash
npm install
npm run dev
```

Production ve kalite kontrolleri:

```bash
npm run lint
npm run format:check
npm run build
npm run preview
```

## Ortam değişkenleri

Örnek dosyayı kopyala:

```bash
cp .env.example .env
```

Backend henüz yoksa `VITE_API_URL` değerini boş bırak. Gerçek API hazır olduğunda:

```env
VITE_API_URL=http://localhost:8000/api
```

Servis katmanının beklediği endpointler:

```text
GET    /customers
POST   /customers
PATCH  /customers/:id
DELETE /customers/:id
```

## Proje yapısı

```text
src/
├── components/
│   ├── charts/
│   ├── customers/
│   │   ├── AddCustomerModal.jsx
│   │   ├── UpdateCustomerModal.jsx
│   │   ├── DeleteCustomerModal.jsx
│   │   ├── CustomerDetailModal.jsx
│   │   ├── CustomerActionsModal.jsx
│   │   └── CustomerForm.jsx
│   ├── dashboard/
│   ├── layout/
│   └── ui/
├── data/
│   └── mockData.js
├── hooks/
│   └── useCustomers.js
├── layout/
├── pages/
├── services/
│   └── customerService.js
└── styles/
    ├── base.css
    ├── layout.css
    ├── dashboard.css
    ├── customers.css
    ├── ui.css
    ├── pages.css
    └── animations.css
```

## Müşteri işlemleri

- Müşteri listesi loading ve hata durumlarını destekler.
- Arama isim, ID, telefon ve şehir alanlarında çalışır.
- Müşteri ekleme mock servis üzerinden listeye kayıt ekler.
- Güncelleme ekranında telefon alanı kilitlidir; ad, e-posta, hat tipi, şehir, paket ve etiket değiştirilebilir.
- Silme işleminden önce geri alınamaz işlem onayı gösterilir.
- Müşteri detay, güncelleme, silme ve satır işlemleri ayrı componentlerdir.

## Backend bağlantısı

UI componentleri doğrudan `fetch` çağrısı yapmaz. Akış şöyledir:

```text
CustomersPage
→ useCustomers
→ customerService
→ mock veri veya gerçek API
```

Backend bağlanırken esas olarak `src/services/customerService.js` içindeki endpoint/response uyarlamalarının değiştirilmesi yeterlidir.
