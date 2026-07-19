# 📡 PiA Telekom — Customer & Invoice Management System

A full-stack administration application built for telecom operators, managing customers, subscriptions, and invoicing from a single panel. The system provides an end-to-end operations dashboard covering everything from customer registration and invoice tracking to regional revenue analysis, customer risk scoring, and revenue forecasting.

The project is structured as a **monorepo**:

```
customer-invoice-system/
├── backend/     → Spring Boot REST API (Java 25)
└── frontend/    → React 19 + Vite admin panel
```

## ✨ Key Features

- **Customer Management** — CRUD operations, advanced filtering (JPA Specifications), customer detail views
- **Invoice & Payment Tracking** — invoice creation and updates, summary statistics, top-up (recharge) records
- **Dashboard** — revenue charts, package distribution, subscription summaries, and recommendation cards
- **Analytics Module** — customer risk analysis, collection actions, package upgrade recommendations, and revenue forecasting (powered by Apache Commons Math)
- **Regional Analysis** — city-level revenue and payment performance visualized on an interactive map of Turkey
- **Authentication** — admin login with BCrypt-hashed passwords and session-token-based authorization

## 🛠 Tech Stack

| Layer | Technologies |
|---|---|
| Backend | Java 25, Spring Boot 4, Spring Data JPA, Flyway, Caffeine Cache, springdoc-openapi (Swagger) |
| Database | **PostgreSQL — hosted on [Supabase](https://supabase.com)** (via connection pooler) |
| Frontend | React 19, Vite 8, React Router 7, ESLint + Prettier |
| Dev Tooling | Docker Compose (local PostgreSQL), Maven Wrapper |

### Why Supabase?

The database runs on Supabase's managed PostgreSQL service. This allowed team members to work against a **shared cloud database** without setting up local instances, while schema changes stayed consistent for everyone through versioned Flyway migrations. Connections go through Supabase's **transaction pooler** endpoint (port 6543, `prepareThreshold=0`), which makes efficient use of connection limits in serverless-like environments. For local development, a PostgreSQL container defined in `backend/docker-compose.yml` is available as an alternative.

## Quick Start

```bash
# 1. Start the backend (DB_PASSWORD is required for the Supabase connection)
cd backend
export DB_PASSWORD=<supabase-db-password>
./mvnw spring-boot:run
# → API: http://localhost:8080  |  Swagger: http://localhost:8080/swagger-ui.html

# 2. Start the frontend
cd ../frontend
npm install
npm run dev
# → Panel: http://localhost:5173 (requests are proxied to the backend by Vite)
```

For detailed setup and configuration, see the READMEs in each subdirectory: [`backend/README.md`](backend/README.md) · [`frontend/README.md`](frontend/README.md)

## 👥 Team

This project was developed as a team effort.

Development followed a pull request + code review workflow; see the commit and PR history for individual contributions.

## 📄 License

This project is for educational/portfolio purposes.
