# 🖥 PiA Telecom — Backend (Spring Boot REST API)

The server side of the customer & invoice management system. A layered REST API built with Java 25 and Spring Boot 4, running on PostgreSQL (Supabase).

## 🛠 Technologies

- **Java 25** & **Spring Boot 4.1** (Web MVC, Data JPA, Validation, Cache)
- **PostgreSQL @ Supabase** — managed cloud database, connected via the transaction pooler
- **Flyway** — versioned database migrations (`V1`…`V7`)
- **Caffeine** — in-application caching
- **spring-security-crypto (BCrypt)** — password hashing (a lightweight approach, without wiring up the full Spring Security chain)
- **springdoc-openapi** — auto-generated API documentation via Swagger UI
- **Apache Commons Math** — revenue forecasting calculations
- **Lombok**, **Maven Wrapper**, **Docker Compose** (local DB alternative)

## 🏗 Architecture

A classic layered architecture:

```
controller/      → REST endpoints (Auth, Customer, Invoice, Dashboard, Analysis, ...)
service/         → Business logic (15 services incl. risk analysis, revenue forecasting, recommendation engine)
repository/      → Spring Data JPA repositories
specification/   → JPA Specifications for dynamic filtering
entity/          → JPA entities (Customer, Invoice, Subscription, Region, ...)
dto/             → Request/Response objects (isolation between layers)
security/        → TokenAuthFilter — session token validation
config/          → Cache, OpenAPI, and admin seed configuration
exception/       → Centralized error handling
```

Authentication flow: `POST /api/auth/login` → password verified with BCrypt → a session token is created in the database (`admin_session` table) → the client sends an `Authorization: Bearer <token>` header on subsequent requests → `TokenAuthFilter` validates the token on every request.

## 🗄 Database: Supabase + Flyway

The database is hosted on **Supabase's managed PostgreSQL** service. Connections go through the Supabase **pooler** endpoint (port `6543`); for pooler compatibility, the JDBC URL uses `prepareThreshold=0` and the HikariCP pool is kept small (`maximum-pool-size: 5`) — a configuration that respects Supabase's connection limits.

The schema is managed entirely through **Flyway migrations** (`src/main/resources/db/migration`):

| Migration | Contents |
|---|---|
| `V1__init_schema` | Core tables: region, product, customer, subscription, invoice, recharge |
| `V2__add_analysis_tables` | Risk analysis and collection action tables |
| `V3`–`V5` | Recharge fields, performance indexes, forecast tables |
| `V6`–`V7` | Session and administrator tables |

Thanks to `ddl-auto: validate`, Hibernate never modifies the schema; the migration files are the single source of truth.

## 🚀 Setup & Running

### Option A — Supabase (default)

```bash
# Provide the Supabase database password as an environment variable
export DB_PASSWORD=<supabase-db-password>

./mvnw spring-boot:run
```

To connect to your own Supabase project, copy `application.yml.example` and fill in the `datasource.url` and `username` fields with the values from **Connect → Connection Pooling** in the Supabase dashboard.

### Option B — Local PostgreSQL (Docker)

```bash
docker compose up -d          # starts a postgres:16-alpine container
# Point the datasource in application.yaml to localhost:5432
./mvnw spring-boot:run
```

### Verification

- API: `http://localhost:8080/api/...`
- Swagger UI: `http://localhost:8080/swagger-ui.html`

## 📚 Main Endpoint Groups

| Path | Description |
|---|---|
| `POST /api/auth/login` · `/logout` | Admin login and session management |
| `/api/customers` | Customer CRUD + Specification-based filtering |
| `/api/invoices` | Invoice operations and summary statistics |
| `/api/subscriptions` · `/api/products` | Subscription and package management |
| `/api/dashboard` | Panel statistics, revenue charts |
| `/api/analysis/...` | Customer risk analysis, revenue forecasts, upgrade recommendations |
| `/api/regions` | Regional revenue/payment analysis |

The full endpoint schema can be explored through Swagger UI.

## 🧪 Tests

```bash
./mvnw test
```
