# Meridian — FinTech Banking Frontend

A modern, responsive React frontend for the Spring Boot RTGS & NEFT banking API.
Built with Vite, React Router, Axios, Tailwind, and Context-based auth.

## Quick start

```bash
npm install
cp .env.example .env     # already done in this package
npm run dev              # http://localhost:5173
```

The Spring Boot backend should be running on **http://localhost:8080**. The Vite
dev server proxies `/api` to it automatically, so no CORS setup is needed for
local development (see `BACKEND_CORS_SETUP.md` for deployment).

### Demo login
The backend seeds a user you can sign in with immediately:

- Username `alice` · Password `Password123`

### Build for production
```bash
npm run build        # outputs to dist/
npm run preview      # serve the production build locally
```
Set `VITE_API_BASE_URL` in `.env` to your deployed backend URL for production.

## What's included

| Module | Pages / components | Backend endpoints used |
|--------|--------------------|------------------------|
| Auth | Login, Signup | POST /auth/login, /auth/signup |
| Dashboard | balance hero, stat cards, recent transactions | /accounts, /beneficiaries, /transactions |
| Accounts | list, open account | GET/POST /accounts |
| Beneficiaries | list, add (modal), delete (confirm) | GET/POST/DELETE /beneficiaries |
| RTGS transfer | shared TransferForm (instant) | POST /transfers/rtgs |
| NEFT transfer | shared TransferForm (batch) | POST /transfers/neft |
| Transactions | account selector, search, filter, paginated table, details modal | GET /transactions/account/{n} |

## Folder structure

```
src/
  components/        reusable pieces (TransferForm, ErrorBoundary)
    ui/              primitives: Button, Input, Select, Modal, ConfirmDialog,
                     StatusBadge, Spinner, EmptyState, Icon
  pages/             one file per screen
  layouts/           AppLayout (sidebar + topbar), AuthShell, Sidebar, Topbar
  routes/            ProtectedRoute, PublicRoute
  services/          Axios client + one module per API resource
  context/           AuthContext (login/signup/logout, session persistence)
  hooks/             useForm, useAsync
  utils/             storage, format, validators
```

## Security model

- **JWT in localStorage**, attached to every request by an Axios request interceptor.
- **Auto-logout**: an Axios response interceptor catches `401`, clears the session,
  and dispatches an event that `AuthContext` uses to redirect to `/login`.
- **Protected routes**: `ProtectedRoute` blocks unauthenticated access and
  remembers the intended destination; `PublicRoute` keeps signed-in users out of
  login/signup.
- **Session persistence**: the session rehydrates from localStorage on refresh.

## Validation

Client-side validators in `utils/validators.js` mirror the backend's Bean
Validation rules exactly (IFSC pattern, 9–18 digit account numbers, 6+ char
passwords, RTGS minimum amount), so invalid input is caught before any request.

## Notes on backend alignment

- The **create-account** form shows an "Account type" selector for UX, but the
  backend `CreateAccountRequest` only accepts `accountHolderName` and
  `openingBalance`, so account type is not sent. IFSC is assigned server-side.
- **Idempotency keys** are generated fresh per confirmed transfer attempt, so a
  retry after a network error is safe (the backend dedupes on this key).
- The transactions endpoint returns a Spring `Page`; the table reads
  `content`, `totalPages`, and `number` from it.
