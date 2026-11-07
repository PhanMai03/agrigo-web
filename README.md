# 🌱 AgriGo — Modern Organic Agriculture E-Commerce & Management Platform

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![TanStack Query](https://img.shields.io/badge/TanStack_Query-v5-FF4154?style=flat-square&logo=react-query&logoColor=white)](https://tanstack.com/query)
[![Zustand](https://img.shields.io/badge/Zustand-v5-4338CA?style=flat-square)](https://github.com/pmndrs/zustand)
[![Build Status](https://img.shields.io/badge/Build-Passing-10B981?style=flat-square)](https://github.com)

**AgriGo** is a high-performance, enterprise-grade e-commerce web application and management dashboard dedicated to clean, VietGAP/GlobalGAP-certified organic farm produce. Engineered with modern frontend architecture, resilient event-driven token refreshment, interactive 2D slice showcase controls, and responsive UI design.

---

## 🌟 Key Features

### 🛒 1. Customer Storefront
* **Interactive Hero Showcase (Magic Slice Slider)**: Real-time dual-view produce explorer allowing shoppers to slide between whole fruit and interior cross-sections, complete with Brix sweetness ratings and harvest field notes.
* **Smart Produce Catalog & Filtering**:
  * Multi-attribute filtering: Category carousel, price range slider, star rating filters, in-stock availability toggle.
  * Instant text search and sorting (Newest, Price: Low to High, Price: High to Low, Name A-Z).
  * Smooth client-side and server-backed pagination (12 items per grid page).
* **Produce Detail Page**:
  * Dynamic thumbnail slider with responsive multi-image carousel navigation.
  * Clear unit-based pricing formatted in luxury deep wine red (`#4D0E13`) with strikethrough original prices.
  * Direct "Add to Cart" and checkout flows.
* **Shopping Cart & Checkout**:
  * Persistent cart state, item-level selection checkbox, quantity controls, and live subtotal calculations.
  * Integrated multi-payment support: Cash on Delivery (COD) and VNPay online payment gateway.
* **Account & Order Management**:
  * Customer profile management and password security.
  * Real-time order tracking with status milestones (`Pending Review`, `Confirmed`, `In Transit`, `Completed`, `Cancelled`).

### 🛠️ 2. Comprehensive Admin Console
* **Product Catalog Management**: Create, edit, set primary images, adjust stock quantities, and toggle product statuses (`active` / `inactive`).
* **Category Manager**: Organize produce categories with custom imagery, slug management, and descriptions.
* **Order & Fulfillment Center**: Monitor customer orders, update shipping progress, and process VNPay customer refund confirmations.
* **Inventory Ledger & Audit Trail**: Real-time warehouse movement logging tracking inbound imports, sales deductions, order returns, and periodic audit reconciliations.
* **User Directory & RBAC**: Manage customer accounts, grant Administrator privileges, and toggle active/locked states.
* **Hero Showcase Manager**: Full visual CMS to configure the homepage interactive slice banner (upload whole & sliced imagery, update Brix, harvest descriptions, and pricing).

---

## ⚡ Architecture & Engineering Highlights

* **Decoupled Event-Driven Auth Architecture**: Zero circular dependencies between `apiClient.ts` (Axios) and `authStore.ts` (Zustand). Background JWT refresh runs smoothly using pub/sub token synchronization without module deadlocks.
* **Production Chunk Splitting**: Configured manual chunking in `vite.config.ts` separating `vendor-react`, `vendor-query`, `vendor-motion`, and `vendor-libs` — reducing individual bundle sizes to under 250KB and achieving lightning-fast sub-2s production builds.
* **Strict TypeScript Type Safety**: Enforced `"noUnusedLocals": true` and `"noUnusedParameters": true` with zero TypeScript compiler errors or dangling types.
* **100% Internationalized UI**: Clean, professional English terminology across all public storefront routes and private admin backoffices.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Framework & Runtime** | [React 18](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/) |
| **Styling & Animation** | [Tailwind CSS](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/) |
| **State & Data Fetching** | [TanStack React Query v5](https://tanstack.com/query), [Zustand](https://github.com/pmndrs/zustand), [Axios](https://axios-http.com/) |
| **Form & Validation** | [React Hook Form](https://react-hook-form.com/), [Zod](https://zod.dev/), [@hookform/resolvers](https://github.com/react-hook-form/resolvers) |
| **Icons & Assets** | [Lucide React](https://lucide.dev/) |
| **Routing** | [React Router DOM v7](https://reactrouter.com/) |

---

## 📂 Project Structure

```text
src/
├── app/
│   ├── App.tsx                     # Main app root component
│   └── providers.tsx               # TanStack Query & React Context providers
├── assets/
│   ├── brand/                      # Brand logo & graphics
│   └── produce/                    # High-res agricultural imagery
├── components/
│   ├── Container.tsx               # Standardized layout container (1360px)
│   ├── Footer.tsx                  # Storefront footer & newsletter
│   ├── Header.tsx                  # Sticky navbar, search & account links
│   ├── Hero3DSection.tsx           # Interactive 2D Magic Slice banner
│   ├── ProductCard.tsx             # Standard produce card with ratings & prices
│   ├── Reveal.tsx                  # Viewport entry animation wrapper
│   ├── ScrollToAnchor.tsx          # Smooth route anchor handler
│   └── ToastViewport.tsx           # Global notification toast container
├── features/
│   ├── admin/api/hooks.ts          # Admin CRUD hooks & mutations
│   ├── auth/api/hooks.ts           # Authentication queries & mutations
│   ├── cart/api/hooks.ts           # Shopping cart operations
│   ├── orders/api/hooks.ts         # Customer order management
│   └── products/
│       ├── api/catalogApi.ts       # Product filters & normalization
│       ├── api/hooks.ts            # Public product & category hooks
│       └── api/productsApi.ts      # Core product API calls
├── hooks/
│   └── useDebounce.ts              # Search input debounce utility
├── layouts/
│   ├── AdminLayout.tsx             # Admin dashboard shell & sidebar
│   ├── AuthLayout.tsx              # Clean authentication layout
│   └── MainLayout.tsx              # Primary storefront layout
├── lib/
│   └── images.ts                   # Category image fallback mappings
├── pages/
│   ├── admin/                      # 6 dedicated admin dashboard pages
│   ├── AboutPage.tsx               # Farm story, values & guarantee
│   ├── AllProductsPage.tsx         # Full catalog with faceted search
│   ├── CartPage.tsx                # Shopping basket & summary
│   ├── CheckoutPage.tsx            # Shipping information & payment selection
│   ├── ContactPage.tsx             # Contact form & location map
│   ├── HomePage.tsx                # Homepage featuring showcase & categories
│   ├── LoginPage.tsx               # User sign-in
│   ├── OrderDetailPage.tsx         # Detailed order invoice & status
│   ├── OrderHistoryPage.tsx        # Customer past orders
│   ├── ProductDetailPage.tsx      # Comprehensive produce details & gallery
│   ├── ProfilePage.tsx             # User profile & credentials
│   ├── RegisterPage.tsx            # Member registration
│   ├── ResetPasswordPage.tsx       # Password recovery
│   └── VerifyEmailPage.tsx         # Email OTP verification
├── routes/
│   ├── AppRoutes.tsx               # Central application routing table
│   └── ProtectedRoute.tsx          # Role-based route authorization guard
├── services/
│   └── apiClient.ts                # Axios instance with auto-refresh interceptors
├── stores/
│   ├── authStore.ts                # Auth state & user session
│   ├── heroShowcaseStore.ts        # Hero showcase items state (localStorage-backed)
│   └── toastStore.ts               # Global toast alert management
├── styles/
│   └── index.css                   # Tailwind styles & custom typography
├── types/
│   └── api.ts                      # Backend API TypeScript contracts
├── main.tsx                        # DOM mount entry
└── vite-env.d.ts                   # Vite environment definitions
```

---

## 🚀 Getting Started

### Prerequisites
* **Node.js**: `>= 18.x` (Recommended: `v20.x` or `v22.x`)
* **npm**: `>= 9.x`

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/agrigo-web.git
cd agrigo-web
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the project root (you can copy from `.env.example`):

```bash
cp .env.example .env
```

Define the backend API URL:
```env
VITE_API_URL=http://localhost:3000/api
```

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser to view the application.

---

## 📦 Scripts

| Command | Purpose |
| :--- | :--- |
| `npm run dev` | Starts Vite local development server with Hot Module Replacement (HMR). |
| `npm run build` | Runs strict TypeScript type-checking (`tsc -b`) and produces an optimized production bundle in `dist/`. |
| `npm run preview` | Locally serves the production build from `dist/` to verify optimizations. |

---

## 🔒 Role-Based Access Control (RBAC)

The platform provides built-in role protection:

* **Public**: Home, Catalog, Product Details, About, Contact, Login, Register, Forgot Password.
* **Customer**: Profile, Cart, Checkout, Order History, Order Details.
* **Administrator**: All customer routes + Admin Console (`/admin/*`: Products, Categories, Orders, Inventory, Users, Hero Showcase).

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

## 👨‍💻 Author & Contributions

Built with ❤️ by the **AgriGo Development Team**.  
Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com).
