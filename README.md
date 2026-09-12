# Mobixia — Mobile Accessories E-Commerce Platform

A production-grade, full-stack mobile accessories e-commerce web platform built with a clean, high-conversion modern design and fully compliant with the 8-section Software Requirements Specification (SRS).

---

## 📌 Tech Stack & Architecture

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18 (Vite SPA), Tailwind CSS, Lucide React Icons, React Router v6, Axios |
| **Backend** | Node.js, Express.js REST API (`/api/v1`), JWT Authentication (Access & Refresh), Bcrypt, Multer, Morgan |
| **Database & ORM** | **MySQL** (`mobixia_db` on `127.0.0.1:3306`), **Prisma ORM** with 25 relational models & foreign keys |
| **Payment Gateway** | Official **Razorpay API** integration (`rzp_test_Tb3eJTFsLj1VR9`), Cash on Delivery (COD) |
| **Email & SMS** | **Nodemailer with real Gmail SMTP** (`smtp.gmail.com`), real-time SMS notification dispatcher |
| **Invoicing** | Official **GST Tax Invoice** HTML/Print generator (CGST 9% + SGST 9%, HSN `85044090`, Original for Recipient) |
| **Security** | AES-256-GCM encryption for payment secrets, Step-Up password verification for Admin Vault, Granular RBAC Matrix |

---

## 🚀 Key Features

### 🛍️ Customer Storefront
- **Responsive Header & Sticky Navbar**:
  - Live search bar with debounced real-time autosuggest dropdown (product thumbnails, prices, and matching categories).
  - Category navigation tabs for 6 core accessory verticals (Phone Cases, GaN Chargers, Cables, Earphones, Power Banks, Screen Protectors).
  - Wishlist quick-link counter, Cart counter with slideover drawer, and User Profile menu.
- **Dynamic Homepage**:
  - Hero banner carousel with animated slides and direct category links.
  - Category quick-navigation cards with custom icons.
  - Trust Badges strip (Free Shipping > ₹499, 7-Day Returns, 100% Genuine Gear, 24/7 Priority Support).
  - Best Sellers carousel with discount badges (% OFF) and ratings.
  - Tabbed product feed: *Trending Now*, *Highest Rated*, and *Hand-Picked*.
  - Promotional banner grid with CTA buttons.
  - Comprehensive footer with company address, email, phone, WhatsApp support, Call desk, and legal links.
- **Product Catalog & Advanced Filters (`/products`)**:
  - Multi-faceted filter sidebar: Category, Device Model (iPhone, Samsung, OnePlus, Pixel), Brand, Price range slider, and In-Stock toggle.
  - Sorting: Price (Low to High / High to Low), Customer Rating, Newest, and Popularity.
  - View switcher: Grid View and List View.
  - Instant "Add to Cart" and Wishlist heart toggles directly from listing cards.
- **Product Detail Page (PDP) (`/product/:slug`)**:
  - Multi-image gallery with high-resolution view and thumbnail selector.
  - Dynamic variant selector (Colors & Device Models) with synchronized pricing, MRP, and stock availability.
  - Real-time stock status badge (*In Stock*, *Low Stock Alert*, *Out of Stock*).
  - 6-digit Indian Pincode delivery serviceability checker with transit time estimates.
  - Technical specifications table (Material, Compatibility, Fast Charging support, Warranty).
  - Verified Customer Reviews with 5-star rating breakdown bars and review submission modal.
  - Related Accessories Carousel ("You May Also Like").
- **Full-Page Shopping Cart (`/cart`)**:
  - Interactive item rows with quantity adjusters (`+`, `-`, direct number entry) and instant line subtotal.
  - "Save for Later" shelf below the cart with 1-click move back to cart.
  - Real-time Free Shipping progress meter (unlocks at ₹499).
  - Voucher / Promo Code engine with clickable suggestions (`FIRST10` for 10% OFF, `FREESHIP`).
  - Itemized price breakdown: Subtotal, Discounts, Delivery Fee, 18% GST (CGST + SGST), and Grand Total.
- **Streamlined Checkout Flow (`/checkout`)**:
  - **Guest Checkout & Authenticated Checkout**: Unregistered visitors can checkout with name/email/phone; logged-in buyers can pick from saved addresses.
  - **Pincode Verification**: Interactive 6-digit postal code check with instant serviceability confirmation.
  - **Delivery Slot & Speed**: Standard Surface (3–5 days) or Priority Next-Day Air Express (₹49) with preferred time windows.
  - **Payment Options**: Cash on Delivery (COD) or Online Payment via live Razorpay checkout popup.
  - **Step 4 Order Review**: Comprehensive pre-placement verification card before final confirmation.
- **Order Confirmation & Live Communications (`/order-confirmation/:orderNo`)**:
  - Celebration header with unique Order ID (e.g., `MBX-2609-3821`).
  - Live email receipt dispatch via Gmail SMTP (`pritamgangurde18@gmail.com`) and SMS dispatch log.
  - Printable official GST Tax Invoice button.
  - Direct link to live order tracker.
- **Visual Order Tracking (`/track/:orderNo`)**:
  - 6-stage visual delivery stepper: `PLACED` ➔ `CONFIRMED` ➔ `PACKED` ➔ `SHIPPED` ➔ `OUT_FOR_DELIVERY` ➔ `DELIVERED`.
  - Real-time courier partner info (BlueDart / Delhivery), AWB tracking number, and live tracking URL.
  - Order cancellation option (allowed before shipping).
  - 7-Day Return / Replacement request form with reason selector.
- **Customer Account Portal (`/account`)**:
  - Order history tab with re-order links and invoice downloads.
  - Saved Address Book (Add, Edit, Set Default, Delete).
  - My Wishlist management.
  - Profile details & password update.

---

### 🛡️ Multi-Role Admin Back Office (`/admin`)
- **Operations Dashboard**:
  - KPI metric cards: Today's Orders, Total Revenue, Pending Dispatch, Low-Stock Alerts, Total Customers.
  - Interactive 7-day revenue analytics chart and order status pipeline breakdown.
  - Recent orders queue and latest customer reviews feed.
- **Product & Catalog Management (`/admin/products`)**:
  - Full CRUD for products with multi-variant management (SKU, Color, Device Model, Price, MRP, Stock).
  - Low-stock indicator badges (≤ 5 units).
  - Featured and Best-Seller quick toggles.
- **Order Fulfillment & Logistics (`/admin/orders`)**:
  - Status filters (`PLACED`, `CONFIRMED`, `PACKED`, `SHIPPED`, `DELIVERED`, `CANCELLED`).
  - Dispatch modal: update status, assign courier partner, input tracking AWB ID and tracking link.
  - Direct view and print of customer GST Tax Invoices.
- **Customer Management (`/admin/customers`)**:
  - Search customers by name, email, or mobile.
  - View total orders and cumulative spend.
  - One-click account Block / Unblock toggle.
- **Marketing & Promotions (`/admin/marketing`)**:
  - Coupon Code manager: Create flat or percentage discounts, minimum order requirement, max discount cap, expiry date.
  - Hero banner slider & promo banner manager with custom link targets and active toggles.
- **Review Moderation (`/admin/reviews`)**:
  - Moderate incoming buyer reviews: Approve, Reject, or Delete.
- **Content Management System (`/admin/cms`)**:
  - Dynamic content editor for policy pages (About Us, Privacy Policy, Terms & Conditions, Shipping Policy, Refund Policy).
  - Customer contact desk inquiries inbox.
- **Reports & Analytics (`/admin/reports`)**:
  - Sales summary (Revenue, Orders, Average Order Value).
  - Inventory stock level report with 1-click **CSV export**.
- **Store Settings (`/admin/settings`)**:
  - Store identity, GSTIN, registered address, support contact info.
  - Free shipping threshold and standard delivery fees.
- **Payment Gateway Security Vault (`/admin/payment-settings`) — Super Admin Only**:
  - Razorpay Test / Live mode switcher.
  - AES-256-GCM encryption at rest for Key ID & Key Secret.
  - Masked credentials view (`••••••••1VR9`).
  - Step-up re-authentication modal (requires Super Admin password to reveal or edit keys).
  - Key reveal actions permanently logged in the audit trail.
- **Staff Accounts & Granular RBAC Permissions Matrix (`/admin/staff`) — Super Admin Only**:
  - Create staff accounts and assign system or custom roles.
  - 11 modules × 4 actions (`view`, `create`, `edit`, `delete`) interactive permissions matrix.
- **System Audit Trail (`/admin/audit`)**:
  - Chronological immutable log tracking User, Module, Action, Description, IP Address, and Timestamp.

---

## 🔑 Pre-Configured Test Logins

The database is pre-seeded with authentic catalog items, orders, and user accounts. You can click the quick-fill buttons in the Sign In modal or use these credentials:

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `superadmin@mobixia.in` | `Password@123` | Full system control, payment credentials vault, staff RBAC matrix, audit logs |
| **Admin** | `admin@mobixia.in` | `Password@123` | Catalog CRUD, order fulfillment, marketing, reviews, CMS, reports |
| **Staff Manager** | `manager@mobixia.in` | `Password@123` | Products, inventory stock, order packing, view-only reports |
| **Customer** | `pritamgangurde17@gmail.com` | `Password@123` | Customer storefront, cart, checkout, saved addresses, order tracking |
| **Customer (Alt)** | `customer@mobixia.in` | `Password@123` | Secondary test buyer account |

---

## 📁 Project Directory Structure

```
mobile-accessories-platform/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma            # 25 MySQL relational tables & relations
│   │   └── seed.js                  # Database seeder (products, variants, users, banners)
│   ├── src/
│   │   ├── config/                  # Prisma client instance
│   │   ├── controllers/             # Auth, Product, Order, Admin, CMS, Coupon controllers
│   │   ├── middleware/              # JWT Auth, RBAC permission checker, audit logger
│   │   ├── routes/                  # Express /api/v1 route definitions
│   │   ├── utils/
│   │   │   ├── crypto.js            # AES-256-GCM encryption for credentials
│   │   │   ├── invoice.js           # GST Tax Invoice HTML/Print generator
│   │   │   ├── mailer.js            # Nodemailer Gmail SMTP dispatcher
│   │   │   └── sms.js               # SMS notification dispatcher
│   │   └── server.js                # Express app initialization & port listener
│   └── .env                         # Server port, MySQL URL, JWT secrets, Razorpay keys
├── frontend/
│   ├── public/                      # Static assets & favicon
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/               # AdminLayout, Sidebar, Navbar, StatCard
│   │   │   ├── common/              # Logo, Modal, RatingStars, StatusBadge
│   │   │   └── storefront/          # Header, Footer, ProductCard, CartDrawer, HeroSlider
│   │   ├── context/                 # AuthContext, CartContext, WishlistContext
│   │   ├── pages/
│   │   │   ├── admin/               # 11 Admin back office pages
│   │   │   └── storefront/          # HomePage, ProductListing, Cart, Checkout, OrderTracking, etc.
│   │   ├── services/
│   │   │   └── api.js               # Axios instance with JWT interceptors
│   │   ├── utils/                   # Currency (₹), date, and string formatters
│   │   ├── App.jsx                  # React Router v6 route configuration
│   │   └── main.jsx                 # React root render
│   ├── index.html                   # HTML template + Razorpay Checkout SDK
│   └── package.json
├── package.json                     # Root scripts for launching frontend & backend
└── README.md
```

---

## ⚙️ Local Setup & Installation

### Prerequisites
- **Node.js** (v18.0.0 or higher)
- **MySQL Server** running locally on port `3306` (e.g. via XAMPP, WAMP, or MySQL Windows Service)
- Database created in MySQL:
  ```sql
  CREATE DATABASE mobixia_db;
  ```

### 1. Backend Setup
1. Open a terminal and navigate to the `backend` directory:
   ```powershell
   cd backend
   ```
2. Install dependencies:
   ```powershell
   npm install
   ```
3. Verify your `backend/.env` settings:
   ```env
   PORT=5000
   NODE_ENV=development
   DATABASE_URL="mysql://root:@127.0.0.1:3306/mobixia_db"
   JWT_SECRET=mobixia_jwt_super_secure_secret_key_2026_nexgear
   JWT_REFRESH_SECRET=mobixia_jwt_refresh_secure_secret_key_2026_nexgear
   JWT_EXPIRES_IN=7d
   ENCRYPTION_KEY=e83a7c6412f9b1d034876b51e60f2798e83a7c6412f9b1d034876b51e60f2798
   CLIENT_URL=http://localhost:5173

   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=pritamgangurde18@gmail.com
   SMTP_PASS=rvaacmtjaezreoir
   SMTP_FROM="Mobixia Support <pritamgangurde18@gmail.com>"

   RAZORPAY_KEY_ID=rzp_test_Tb3eJTFsLj1VR9
   RAZORPAY_KEY_SECRET=M3P24lGMoCy7QsEgPuomqA99
   ```
4. Push Prisma schema to MySQL and seed catalog/admin data:
   ```powershell
   npx prisma generate
   npx prisma db push
   node prisma/seed.js
   ```
5. Start the backend server:
   ```powershell
   npm start
   ```
   > Server running at: `http://localhost:5000` (API Base: `http://localhost:5000/api/v1`)

---

### 2. Frontend Setup
1. Open a separate terminal and navigate to `frontend`:
   ```powershell
   cd frontend
   ```
2. Install dependencies:
   ```powershell
   npm install
   ```
3. Start Vite dev server:
   ```powershell
   npm run dev
   ```
   > Frontend running at: `http://localhost:5173` (or `http://localhost:5174`)

---

## 🧪 Testing Checklist & Sample Data

- **Promotional Coupons**:
  - `FIRST10` — 10% instant discount on total cart
  - `FREESHIP` — 100% discount on delivery fee
- **Pincode Verification**:
  - Test Indian postal codes: `400050` (Mumbai), `110001` (Delhi), `560001` (Bengaluru)
- **Payment Testing**:
  - **Cash on Delivery (COD)**: Instantly confirms order without pre-payment.
  - **Razorpay Online Payment**: Opens official Razorpay modal in Test Mode using pre-configured key `rzp_test_Tb3eJTFsLj1VR9`. Supports NetBanking, Cards, and UPI simulator.
- **GST Invoice Download**:
  - Accessible directly after placing an order or via:
    `http://localhost:5000/api/v1/orders/{orderId}/invoice`
  - Includes full breakdown (Base Price, HSN `85044090`, CGST 9%, SGST 9%, Delivery Fee, and Grand Total) with 1-click Print/PDF save.
- **Live Notifications**:
  - Live HTML order confirmations sent via Gmail SMTP to the customer's email.
