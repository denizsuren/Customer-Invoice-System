# 🎨 PiA Telecom — Frontend (React Admin Panel)

The user interface of the customer & invoice management system. A component-based admin panel built with React 19 + Vite. When the backend isn't available, it can run independently in **mock data mode** — which allowed the frontend and backend teams to develop in parallel.

## 🛠 Technologies

- **React 19** + **Vite 8** — fast development and builds
- **React Router 7** — page routing
- **ESLint + Prettier** — code quality and consistent formatting
- A **custom component library** built without external UI dependencies (Modal, Badge, Pagination, FormField, chart components...)

## 📁 Project Structure

```
src/
├── pages/         → Dashboard, Customers, Invoices, Analytics, Regional, Settings, Login
├── components/
│   ├── ui/        → Reusable base components (Button, Modal, Badge, ...)
│   ├── customers/ → Customer table, filter, and modal components
│   ├── invoices/  → Invoice form and table components
│   ├── charts/    → Revenue, package distribution, and city-level charts
│   ├── analytics/ → Risk, forecast, and recommendation cards
│   ├── regional/  → Turkey map (TurkeyMap) visualization
│   └── layout/    → Sidebar, Topbar, icons
├── services/      → API client + service layer (auth, customer, invoice, ...)
├── hooks/         → Custom hooks (useInvoices, ...)
├── context/       → Global state management
├── i18n/          → Internationalization infrastructure
└── data/          → Mock data sources
```

The service layer transparently switches between the **real API** and **mock data** based on the `VITE_API_URL` value; pages have no knowledge of which source is in use.

## 🚀 Setup & Running

```bash
npm install
cp .env.example .env
npm run dev        # → http://localhost:5173
```

### Environment Variables (`.env`)

| Value | Behavior |
|---|---|
| `VITE_API_URL=/api` | **Recommended.** Requests go through the Vite proxy (`vite.config.js` → `localhost:8080`). Since they originate from the same origin, **no CORS issues occur.** |
| `VITE_API_URL=http://localhost:8080/api` | Direct requests to the backend (cross-origin; requires the CORS configuration on the backend) |
| `VITE_API_URL=` (empty) | **Mock mode** — runs with sample data, no backend needed |

> The backend uses PostgreSQL hosted on Supabase as its database; the frontend has no direct connection to Supabase — all data access goes through the REST API.

## 🧹 Quality Checks

```bash
npm run lint           # ESLint
npm run format:check   # Prettier check
npm run format         # Auto-formatting
npm run build          # Production build
npm run preview        # Build preview
```

## 🔐 Session Flow

The session token obtained from the login page is attached to every request by the `apiClient` in the service layer as an `Authorization: Bearer <token>` header. The token is validated against the database on the backend.
