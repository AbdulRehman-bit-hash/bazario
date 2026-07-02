# 🛒 Bazario — MERN Multivendor Marketplace

A full-stack multivendor e-commerce platform built with MongoDB, Express.js, React, and Node.js.

---

## 📁 Project Structure

```
bazario/
├── package.json          ← Root (run both servers together)
├── client/               ← React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/   ← Navbar, Footer, ProductCard, MainLayout
│   │   │   ├── vendor/   ← VendorLayout
│   │   │   └── admin/    ← AdminLayout
│   │   ├── pages/
│   │   │   ├── buyer/    ← Home, Products, Cart, Checkout, Orders...
│   │   │   ├── vendor/   ← Dashboard, Products, Orders, Register
│   │   │   └── admin/    ← Dashboard, Vendors, Users, Orders
│   │   ├── store/
│   │   │   ├── index.js
│   │   │   └── slices/   ← authSlice, cartSlice, productsSlice
│   │   └── utils/
│   │       └── api.js    ← Axios instance w/ auto token refresh
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── index.html
└── server/               ← Express.js backend
    ├── server.js         ← Entry point
    ├── config/
    │   ├── db.js         ← MongoDB connection
    │   └── cloudinary.js ← Image upload config
    ├── models/
    │   ├── User.js
    │   ├── Vendor.js
    │   ├── Product.js
    │   ├── Order.js
    │   ├── Review.js
    │   └── Category.js
    ├── controllers/
    │   ├── authController.js
    │   ├── productController.js
    │   ├── orderController.js
    │   ├── vendorController.js
    │   └── adminController.js
    ├── routes/
    │   ├── authRoutes.js
    │   ├── productRoutes.js
    │   ├── orderRoutes.js
    │   ├── vendorRoutes.js
    │   ├── adminRoutes.js
    │   ├── categoryRoutes.js
    │   ├── userRoutes.js
    │   ├── reviewRoutes.js
    │   ├── uploadRoutes.js
    │   └── paymentRoutes.js
    ├── middleware/
    │   └── authMiddleware.js
    └── utils/
        └── tokenUtils.js
```

---

## ⚙️ Prerequisites

Before starting, make sure you have:

- **Node.js** v18+ ([download](https://nodejs.org))
- **npm** v9+
- **MongoDB Atlas** account (free tier is fine) — [mongodb.com/atlas](https://www.mongodb.com/atlas)
- **Cloudinary** account (free tier) — [cloudinary.com](https://cloudinary.com)
- **Stripe** account (test mode) — [stripe.com](https://stripe.com)

---

## 🚀 Step-by-Step Setup

### Step 1 — Clone / Download the project

Place the `bazario/` folder wherever you like on your machine.

### Step 2 — Install all dependencies

From the root `bazario/` folder:

```bash
npm install
cd server && npm install
cd ../client && npm install
cd ..
```

Or simply:
```bash
npm run install:all
```

### Step 3 — Configure Server Environment Variables

```bash
cd server
cp .env.example .env
```

Now open `server/.env` and fill in the following:

#### MongoDB Atlas
1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas) → Create a free cluster
2. Click **Connect** → **Drivers** → copy the connection string
3. Replace `<password>` with your DB user password
4. Paste into `MONGO_URI=`

```env
MONGO_URI=mongodb+srv://myuser:mypassword@cluster0.abc123.mongodb.net/bazario?retryWrites=true&w=majority
```

#### JWT Secrets
Generate two random 64-character strings (use [randomkeygen.com](https://randomkeygen.com)):

```env
JWT_ACCESS_SECRET=your_64_char_random_string_here
JWT_REFRESH_SECRET=another_64_char_random_string_here
```

#### Cloudinary
1. Go to [cloudinary.com](https://cloudinary.com) → Dashboard
2. Copy **Cloud Name**, **API Key**, **API Secret**

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz
```

#### Stripe
1. Go to [stripe.com](https://stripe.com) → Developers → API Keys
2. Copy **Secret key** (starts with `sk_test_`)

```env
STRIPE_SECRET_KEY=sk_test_51abc...
```

### Step 4 — Configure Client Environment Variables

```bash
cd client
cp .env.example .env
```

Open `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51abc...   # from Stripe dashboard
```

### Step 5 — Seed Initial Categories (Optional but recommended)

Connect to your MongoDB Atlas cluster using [MongoDB Compass](https://www.mongodb.com/products/compass) or run this one-time script from the server folder:

```bash
cd server
node -e "
import('./config/db.js').then(async ({default: connect}) => {
  await connect();
  const Category = (await import('./models/Category.js')).default;
  const cats = ['Electronics','Fashion','Home & Garden','Books','Sports','Food & Grocery','Toys','Beauty & Health'];
  await Category.insertMany(cats.map((name, i) => ({ name, order: i })));
  console.log('Categories seeded!');
  process.exit(0);
});
"
```

### Step 6 — Run the Application

From the root `bazario/` folder:

```bash
npm run dev
```

This starts both servers simultaneously:
- **Backend** → http://localhost:5000
- **Frontend** → http://localhost:5173

Open http://localhost:5173 in your browser.

---

## 👥 Creating Test Accounts

### Create an Admin account

Since admins can't self-register, insert one directly via MongoDB Compass or Atlas:

1. Open your MongoDB cluster → `bazario` database → `users` collection
2. Insert:
```json
{
  "name": "Admin User",
  "email": "admin@bazario.com",
  "password": "$2a$12$...",
  "role": "admin",
  "isActive": true
}
```

**Or easier** — register a normal account first, then in Atlas change the `role` field to `"admin"`.

### Create a Buyer account
→ Go to http://localhost:5173/register → choose "Shop / Buy"

### Create a Vendor account
→ Go to http://localhost:5173/register → choose "Sell Products"
→ After registration, go to http://localhost:5173/become-vendor to fill in your shop details
→ An admin must approve the vendor from the Admin Panel before they can list products

---

## 🗺️ URL Reference

| URL | Description |
|-----|-------------|
| `/` | Homepage |
| `/products` | All products with filters |
| `/products/:slug` | Product detail |
| `/shop/:slug` | Vendor shop page |
| `/cart` | Shopping cart |
| `/checkout` | Checkout (buyer only) |
| `/orders` | My orders (buyer only) |
| `/wishlist` | Wishlist (buyer only) |
| `/login` | Login |
| `/register` | Register |
| `/become-vendor` | Vendor registration form |
| `/vendor` | Vendor dashboard |
| `/vendor/products` | Manage products |
| `/vendor/orders` | Vendor orders |
| `/admin` | Admin dashboard |
| `/admin/vendors` | Approve/reject vendors |
| `/admin/users` | Manage users |
| `/admin/orders` | All platform orders |

---

## 🔌 API Reference

### Auth
| Method | URL | Access | Description |
|--------|-----|--------|-------------|
| POST | `/api/auth/register` | Public | Register |
| POST | `/api/auth/login` | Public | Login |
| POST | `/api/auth/logout` | Private | Logout |
| POST | `/api/auth/refresh` | Public | Refresh token |
| GET | `/api/auth/me` | Private | Get current user |

### Products
| Method | URL | Access | Description |
|--------|-----|--------|-------------|
| GET | `/api/products` | Public | Get all (filter/search/page) |
| GET | `/api/products/:slug` | Public | Get single product |
| GET | `/api/products/my` | Vendor | Get my products |
| POST | `/api/products` | Vendor | Create product |
| PUT | `/api/products/:id` | Vendor | Update product |
| DELETE | `/api/products/:id` | Vendor | Delete product |

### Orders
| Method | URL | Access | Description |
|--------|-----|--------|-------------|
| POST | `/api/orders` | Buyer | Create order |
| GET | `/api/orders/my` | Buyer | My orders |
| GET | `/api/orders/vendor` | Vendor | Vendor orders |
| PUT | `/api/orders/:id/vendor-status` | Vendor | Update status |
| GET | `/api/orders/:id` | Private | Single order |

### Vendors
| Method | URL | Access | Description |
|--------|-----|--------|-------------|
| POST | `/api/vendors/register` | Private | Register vendor |
| GET | `/api/vendors/me` | Vendor | My profile |
| PUT | `/api/vendors/me` | Vendor | Update profile |
| GET | `/api/vendors/dashboard` | Vendor | Dashboard stats |
| GET | `/api/vendors/:slug` | Public | Public shop page |

### Admin
| Method | URL | Access | Description |
|--------|-----|--------|-------------|
| GET | `/api/admin/stats` | Admin | Platform stats |
| GET | `/api/admin/vendors` | Admin | All vendors |
| PUT | `/api/admin/vendors/:id` | Admin | Approve/reject |
| GET | `/api/admin/users` | Admin | All users |
| PUT | `/api/admin/users/:id/toggle` | Admin | Toggle active |
| GET | `/api/admin/orders` | Admin | All orders |

---

## 🔨 What Pages Still Need Implementation

These pages have scaffolding (routing works) but the UI/logic needs to be built:

- `pages/buyer/ProductDetailPage.jsx` — Product images, description, reviews, add to cart
- `pages/buyer/CheckoutPage.jsx` — Address form + Stripe payment form
- `pages/buyer/OrdersPage.jsx` — Order list with status tracking
- `pages/buyer/VendorShopPage.jsx` — Public vendor profile + product grid
- `pages/buyer/WishlistPage.jsx` — Saved products
- `pages/vendor/VendorProducts.jsx` — Product CRUD table with modals
- `pages/vendor/VendorOrders.jsx` — Order table with status update
- `pages/vendor/VendorRegister.jsx` — Vendor onboarding form
- `pages/admin/AdminDashboard.jsx` — Charts, stats, recent activity
- `pages/admin/AdminVendors.jsx` — Vendor approval workflow
- `pages/admin/AdminUsers.jsx` — User management table
- `pages/admin/AdminOrders.jsx` — All orders overview

---

## 🧰 Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS |
| State Management | Redux Toolkit |
| Routing | React Router v6 |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Auth | JWT (access + refresh tokens) |
| Image Upload | Cloudinary + Multer |
| Payments | Stripe |
| Notifications | react-hot-toast |

---

## 🚢 Deploying to Production

### Backend (Railway / Render)
1. Push `server/` to a GitHub repo
2. Connect to [Railway](https://railway.app) or [Render](https://render.com)
3. Add all `.env` variables in the dashboard
4. Set start command: `node server.js`

### Frontend (Vercel / Netlify)
1. Push `client/` to GitHub
2. Connect to [Vercel](https://vercel.com)
3. Add `VITE_API_URL` pointing to your deployed backend URL
4. Build command: `npm run build`, output dir: `dist`

---

## 🐛 Common Issues

**MongoDB connection fails** → Check your IP is whitelisted in Atlas (Network Access → Add Current IP)

**Images not uploading** → Double-check your Cloudinary credentials in `.env`

**CORS errors** → Make sure `CLIENT_URL` in server `.env` matches your frontend URL exactly

**Stripe payment fails** → Use Stripe test card: `4242 4242 4242 4242`, any future date, any CVC
