# POS Inventory System

Studio OS–inspired point-of-sale inventory admin with dark & light themes, live form validation, animated toasts, confirmation dialogs, multi-product add with preview, and multi-select edit/delete.

## Administrator credentials

| Field    | Value       |
|----------|-------------|
| Username | `admin`     |
| Password | `Admin@123` |

Use these credentials on the login screen to access the dashboard.

## Features

- **Dark & light themes** — glassmorphism shell matching the Studio OS reference UI; toggle from the header
- **Live validation** — product and login fields validate as you type/blur with success/error borders
- **Animated toast alerts** — success, error, warning, and info feedback with progress dismiss
- **Confirmation popups** — logout, delete (single/bulk), and update require explicit confirm or cancel
- **Multi-product add** — `+` button adds multiple items; **Preview all** shows a summary before submit
- **Multi-select** — select products to bulk edit or bulk delete from the floating action bar

## Quick start

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`), sign in with the admin credentials above.

```bash
npm run build    # production build
npm run preview  # preview production build
```

## App routes

| Route            | Description                          |
|------------------|--------------------------------------|
| `/login`         | Administrator sign-in                |
| `/`              | Dashboard overview                   |
| `/products`      | Catalog with multi-select actions    |
| `/add-products`  | Batch create + preview + submit      |
| `/categories`    | Category cards                       |
| `/transactions`  | Recent invoice / stock activity      |

Product data is seeded locally and persisted in `localStorage` under `pos-products`.
