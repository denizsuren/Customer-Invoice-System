# 🖥 PiA Telekom — Backend (Spring Boot REST API)

Müşteri & fatura yönetim sisteminin sunucu tarafı. Java 25 ve Spring Boot 4 ile geliştirilmiş, PostgreSQL (Supabase) üzerinde çalışan katmanlı bir REST API.

## 🛠 Teknolojiler

- **Java 25** & **Spring Boot 4.1** (Web MVC, Data JPA, Validation, Cache)
- **PostgreSQL @ Supabase** — yönetilen bulut veritabanı, transaction pooler üzerinden bağlantı
- **Flyway** — versiyonlanmış veritabanı migration'ları (`V1`…`V7`)
- **Caffeine** — uygulama içi önbellekleme
- **spring-security-crypto (BCrypt)** — parola hash'leme (tam Spring Security zinciri kurulmadan, hafif bir çözüm)
- **springdoc-openapi** — Swagger UI ile otomatik API dokümantasyonu
- **Apache Commons Math** — gelir tahminleme hesaplamaları
- **Lombok**, **Maven Wrapper**, **Docker Compose** (lokal DB alternatifi)

## 🏗 Mimari

Klasik katmanlı mimari uygulanmıştır:

```
controller/      → REST endpoint'leri (Auth, Customer, Invoice, Dashboard, Analysis, ...)
service/         → İş mantığı (risk analizi, gelir tahmini, öneri motoru dahil 15 servis)
repository/      → Spring Data JPA repository'leri
specification/   → Dinamik filtreleme için JPA Specification'lar
entity/          → JPA entity'leri (Customer, Invoice, Subscription, Region, ...)
dto/             → Request/Response nesneleri (katmanlar arası izolasyon)
security/        → TokenAuthFilter — oturum token'ı doğrulama
config/          → Cache, OpenAPI ve admin seed yapılandırmaları
exception/       → Merkezi hata yönetimi
```

Kimlik doğrulama akışı: `POST /api/auth/login` → BCrypt ile parola doğrulanır → veritabanında oturum token'ı oluşturulur (`admin_session` tablosu) → istemci sonraki isteklerde `Authorization: Bearer <token>` başlığı gönderir → `TokenAuthFilter` her istekte token'ı doğrular.

## 🗄 Veritabanı: Supabase + Flyway

Veritabanı, **Supabase'in yönetilen PostgreSQL** hizmetinde barındırılır. Bağlantı, Supabase **pooler** endpoint'i üzerinden yapılır (port `6543`); pooler ile uyum için JDBC URL'de `prepareThreshold=0` kullanılır ve HikariCP havuzu küçük tutulur (`maximum-pool-size: 5`) — Supabase'in bağlantı limitlerine saygılı bir yapılandırmadır.

Şema tamamen **Flyway migration'ları** ile yönetilir (`src/main/resources/db/migration`):

| Migration | İçerik |
|---|---|
| `V1__init_schema` | Temel tablolar: region, product, customer, subscription, invoice, recharge |
| `V2__add_analysis_tables` | Risk analizi ve tahsilat aksiyon tabloları |
| `V3`–`V5` | Recharge alanları, performans indeksleri, tahmin tabloları |
| `V6`–`V7` | Oturum ve yönetici tabloları |

`ddl-auto: validate` ayarı sayesinde Hibernate şemayı asla değiştirmez; tek doğruluk kaynağı migration dosyalarıdır.

## 🚀 Kurulum & Çalıştırma

### Seçenek A — Supabase (varsayılan)

```bash
# Supabase veritabanı şifresini ortam değişkeni olarak ver
export DB_PASSWORD=<supabase-db-sifresi>

./mvnw spring-boot:run
```

Kendi Supabase projenize bağlanmak için `application.yml.example` dosyasını kopyalayıp `datasource.url` ve `username` alanlarını Supabase panelindeki **Connect → Connection Pooling** bilgileriyle doldurun.

### Seçenek B — Lokal PostgreSQL (Docker)

```bash
docker compose up -d          # postgres:16-alpine container'ı başlatır
# application.yaml'daki datasource'u localhost:5432'ye yönlendirin
./mvnw spring-boot:run
```

### Doğrulama

- API: `http://localhost:8080/api/...`
- Swagger UI: `http://localhost:8080/swagger-ui.html`

## 📚 Başlıca Endpoint Grupları

| Yol | Açıklama |
|---|---|
| `POST /api/auth/login` · `/logout` | Admin girişi ve oturum yönetimi |
| `/api/customers` | Müşteri CRUD + Specification tabanlı filtreleme |
| `/api/invoices` | Fatura işlemleri ve özet istatistikler |
| `/api/subscriptions` · `/api/products` | Abonelik ve paket yönetimi |
| `/api/dashboard` | Panel istatistikleri, gelir grafikleri |
| `/api/analysis/...` | Müşteri risk analizi, gelir tahmini, yükseltme önerileri |
| `/api/regions` | Bölgesel gelir/ödeme analizi |

Tüm endpoint'lerin ayrıntılı şeması Swagger UI üzerinden incelenebilir.

## 🧪 Test

```bash
./mvnw test
```
