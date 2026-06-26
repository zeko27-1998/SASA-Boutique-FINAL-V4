# 🌸 SASA Boutique — Full E-Commerce Website

A complete bilingual (Arabic/English) e-commerce platform built with
React + Tailwind + Express.

---

## 🚀 How to Run (2 terminals)

### Terminal 1 — Backend API
```bash
cd backend
npm install
node server.js
# → http://localhost:5000
```

### Terminal 2 — Frontend
```bash
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

Open your browser at **http://localhost:3000** 🎉

---

## 🔑 Admin Login
| Email                        | Password  |
|------------------------------|-----------|
| admin@sasaboutique.com       | admin123  |

Admin panel → http://localhost:3000/admin

---

## 📁 Project Structure

```
SASA-Boutique/
│
├── backend/
│   ├── server.js          ← Express API (all routes)
│   ├── package.json
│   └── uploads/           ← Product images (auto-created)
│
└── frontend/
    ├── public/
    │   ├── logo.png           ← SASA Boutique logo
    │   ├── favicon.ico        ← Browser tab icon
    │   ├── apple-touch-icon.png
    │   ├── android-chrome-*.png
    │   ├── og-image.png       ← Social share preview
    │   └── site.webmanifest   ← PWA manifest
    │
    └── src/
        ├── App.jsx            ← Routes + providers
        ├── main.jsx
        ├── index.css          ← Global styles + Tailwind
        │
        ├── api/
        │   └── index.js       ← All Axios API calls
        │
        ├── context/
        │   ├── AuthContext.jsx    ← Login/register state
        │   ├── CartContext.jsx    ← Shopping cart state
        │   └── LanguageContext.jsx ← Arabic/English translations
        │
        ├── components/
        │   ├── layout/
        │   │   ├── Navbar.jsx     ← Navigation + language toggle
        │   │   └── Footer.jsx     ← Footer with links
        │   ├── cart/
        │   │   └── CartSidebar.jsx ← Slide-in cart
        │   ├── product/
        │   │   └── ProductCard.jsx ← Product grid card
        │   └── ui/
        │       ├── SplashScreen.jsx ← First-load splash
        │       └── BackToTop.jsx    ← Scroll-to-top button
        │
        └── pages/
            ├── Home.jsx           ← Homepage (hero + new arrivals + categories)
            ├── CategoryPage.jsx   ← Browse & filter by category
            ├── ProductPage.jsx    ← Single product detail
            ├── CheckoutPage.jsx   ← 3-step checkout + payment
            ├── AuthPage.jsx       ← Login & register
            ├── WishlistPage.jsx   ← Saved items
            ├── OrderTrackPage.jsx ← Track order by ID
            ├── AdminPage.jsx      ← Admin dashboard
            └── NotFoundPage.jsx   ← 404 page
```

---

## 🛍️ Features

### Customer-Facing
- 🌸 **Homepage** — Hero banner, new arrivals, categories, featured items, promo banner
- 🔍 **Search** — Search bar with real-time filtering
- 🗂️ **Categories** — Clothes, Shoes, Bags, Beauty, Lifestyle with type + price filters
- ❤️ **Wishlist** — Save favorite items (persists across sessions)
- 🛒 **Cart** — Slide-in cart with quantity controls
- 💳 **Checkout** — 3-step: delivery info → payment → confirmation
- 📦 **Order Tracking** — Track any order by ID
- 🌐 **Bilingual** — Full Arabic/English toggle (with RTL support)
- ✨ **Splash Screen** — Elegant intro on first visit

### Admin Panel (`/admin`)
- 📊 **Dashboard** — Revenue, orders, products, customers stats
- 📦 **Products** — Add/edit/delete with image upload
- 🛒 **Orders** — View all orders, update status
- 👥 **Customers** — View all registered customers

### Payment Methods
- 💳 Mastercard / Visa
- 🏦 Qi Card
- 📱 Zain Cash
- 🚚 Cash on Delivery

---

## 🌍 Going Live (Free)

### Option A — Free subdomain (fastest)
1. Push to GitHub
2. Deploy frontend on **vercel.com** → free `sasaboutique.vercel.app`
3. Deploy backend on **render.com** → free `sasa-api.onrender.com`
4. Set env var in Vercel: `VITE_API_URL=https://sasa-api.onrender.com/api`

### Option B — Custom domain ($0.98/year)
Same as Option A, then:
5. Buy `sasa.store` on **namecheap.com** for $0.98
6. In Vercel → Settings → Domains → add your domain
7. Copy the DNS records to Namecheap → wait 30 min → live!

---

## 🎨 Design

| Element        | Value                              |
|----------------|-------------------------------------|
| Primary color  | Pink `#ec4899`                      |
| Gold accent    | `#C9A84C` (logo color)              |
| Secondary      | Baby blue `#bae6fd`                 |
| Background     | Cream `#FFF8FA`                     |
| Heading font   | Playfair Display (EN) / Cairo (AR)  |
| Body font      | DM Sans (EN) / Tajawal (AR)         |

---

## 📞 Tech Stack

| Layer     | Technology                              |
|-----------|-----------------------------------------|
| Frontend  | React 19, Vite, Tailwind CSS 3          |
| Routing   | React Router v6                         |
| API calls | Axios                                   |
| Backend   | Node.js, Express                        |
| Auth      | JWT (jsonwebtoken) + bcryptjs           |
| Images    | Multer (local upload)                   |
| Toasts    | react-hot-toast                         |
| Icons     | lucide-react                            |

