# 📡 PiA Telekom — Müşteri & Fatura Yönetim Sistemi

Telekom operatörleri için geliştirilmiş, müşteri, abonelik ve fatura süreçlerini tek panelden yöneten full-stack bir yönetim uygulaması. Sistem; müşteri kaydından fatura takibine, bölgesel gelir analizinden müşteri risk skorlamasına ve gelir tahminlemesine kadar uçtan uca bir operasyon paneli sunar.

Proje bir **monorepo** olarak yapılandırılmıştır:

```
customer-invoice-system/
├── backend/     → Spring Boot REST API (Java 25)
└── frontend/    → React 19 + Vite yönetim paneli
```

## ✨ Öne Çıkan Özellikler

- **Müşteri Yönetimi** — CRUD işlemleri, gelişmiş filtreleme (JPA Specification), müşteri detay görünümü
- **Fatura & Ödeme Takibi** — fatura oluşturma, güncelleme, özet istatistikler, TL yükleme (recharge) kayıtları
- **Dashboard** — gelir grafikleri, paket dağılımı, abonelik özetleri ve öneri kartları
- **Analitik Modülü** — müşteri risk analizi, tahsilat aksiyonları, paket yükseltme önerileri ve gelir tahminleme (Apache Commons Math ile)
- **Bölgesel Analiz** — Türkiye haritası üzerinde şehir bazlı gelir ve ödeme performansı görselleştirmesi
- **Kimlik Doğrulama** — BCrypt ile şifrelenmiş admin girişi, oturum token'ı tabanlı yetkilendirme

## 🛠 Teknoloji Yığını

| Katman | Teknolojiler |
|---|---|
| Backend | Java 25, Spring Boot 4, Spring Data JPA, Flyway, Caffeine Cache, springdoc-openapi (Swagger) |
| Veritabanı | **PostgreSQL — [Supabase](https://supabase.com) üzerinde barındırılıyor** (connection pooler ile) |
| Frontend | React 19, Vite 8, React Router 7, ESLint + Prettier |
| Geliştirme | Docker Compose (lokal PostgreSQL), Maven Wrapper |

### Neden Supabase?

Veritabanı olarak Supabase'in yönetilen PostgreSQL hizmeti kullanıldı. Bu sayede ekip üyeleri kendi makinelerinde ayrı veritabanı kurmak zorunda kalmadan **ortak bir buluta bağlı** çalışabildi; şema değişiklikleri Flyway migration'ları ile versiyonlanarak herkeste tutarlı kaldı. Bağlantı, Supabase'in **transaction pooler** endpoint'i (port 6543, `prepareThreshold=0`) üzerinden yapılır — bu, serverless-benzeri ortamlarda bağlantı limitlerini verimli kullanmayı sağlar. Lokal geliştirme için alternatif olarak `backend/docker-compose.yml` ile ayağa kaldırılan bir PostgreSQL container'ı da kullanılabilir.

## 🚀 Hızlı Başlangıç

```bash
# 1. Backend'i başlat (Supabase bağlantısı için DB_PASSWORD gerekir)
cd backend
export DB_PASSWORD=<supabase-db-sifresi>
./mvnw spring-boot:run
# → API: http://localhost:8080  |  Swagger: http://localhost:8080/swagger-ui.html

# 2. Frontend'i başlat
cd ../frontend
npm install
npm run dev
# → Panel: http://localhost:5173 (istekler Vite proxy ile backend'e yönlenir)
```

Detaylı kurulum ve yapılandırma için alt dizinlerdeki README dosyalarına bakın: [`backend/README.md`](backend/README.md) · [`frontend/README.md`](frontend/README.md)

## 👥 Takım

Bu proje ekip çalışması olarak geliştirilmiştir.
Geliştirme süreci pull request + code review akışıyla yürütülmüştür; katkı geçmişi için commit ve PR kayıtlarına bakabilirsiniz.
