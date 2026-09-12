# NexGear ? Mobile Accessories E-Commerce Platform

A production-grade, full-stack mobile accessories e-commerce web platform inspired by the functional architecture of **vortique.in** with an original, high-conversion **Tech-Luxe** modern design.

---

## ?? Key Features

### ?? Customer Storefront
- **Dynamic Homepage**: Multi-slide Hero banner slider, Trust Badges strip (Free Shipping >?499, COD, 7-Day Returns, Authentic Warranty), Shop by Category grid, Best Sellers carousel, Tabbed product feed (Trending / Best Sellers / Hand-Picked), and Promotional banner grid.
- **Global Search & Autosuggest**: Real-time debounce dropdown previewing matching products (with thumbnails and prices) and matching category links.
- **Product Catalog & Advanced Filters**: Multi-faceted filter sidebar (categories, sub-categories, price range, brand, in-stock only), sorting (price low-high/high-low, rating, newest, popular), and grid/list view switcher.
- **Product Detail Page (PDP)**:
  - Interactive multi-image gallery with zoom & thumbnail switching
  - Multi-variant selector (Color swatches, Device models e.g. iPhone 15/16 Pro, Samsung S24 Ultra) with real-time price & stock synchronization
  - Real-time stock status badge (In Stock / Low Stock alert / Out of Stock)
  - Pincode Delivery Checker with transit day estimates
  - Quantity counter, Add to Cart, Buy Now (instant checkout)
  - Full technical specifications table & product overview
  - Verified Customer Reviews with star rating breakdown bars and review submission modal
  - Related Products Carousel ("You May Also Like")
- **Shopping Cart & Slideover Drawer**:
  - Live item counter, editable quantities, remove item
  - Coupon application with instant discount calculation (`FIRST10`, `FLAT200`)
  - Free shipping progress bar (unlocked at ?499)
- **Multi-Step Checkout**:
  - Delivery address selection / inline new address form
  - Payment method selection: Cash on Delivery (COD) & Razorpay Online Payment Gateway Sandbox Simulator
  - GST-compliant invoice breakdown (18% GST, CGST + SGST)
- **Visual Order Tracking**:
  - Visual status stepper: `PLACED` ? `CONFIRMED` ? `PACKED` ? `SHIPPED` ? `OUT_FOR_DELIVERY` ? `DELIVERED`
  - Real-time courier partner details & AWB tracking link (BlueDart, Delhivery, etc.)
  - Order cancellation modal (if prior to shipping)
  - 7-Day Replacement / Return request modal with reason selector
  - Printable GST Tax Invoice download
- **Customer Account Portal**:
  - Order history with re-order and tracking links
  - Address book management (Add, Edit, Set Default, Delete)
  - Saved Wishlist
  - Profile details & password update

---

### ??? Multi-Role Admin Back Office (`/admin`)
- **Operations Dashboard**:
  - KPI Cards: Today's Orders, Total Revenue, Pending Dispatch, Low-Stock Alerts, Total Customers
  - 7-Day interactive sales revenue chart
  - Order status pipeline distribution
  - Recent orders queue & latest reviews widget
- **Product & Catalog Management**:
  - Full Product CRUD with multi-variant manager (color, device model, price, MRP, stock, SKU)
  - Best Seller & Featured flags
  - Low-stock indicator badges (&le; 5 units)
- **Order Fulfillment & Logistics**:
  - Filter by status (`PLACED`, `CONFIRMED`, `PACKED`, `SHIPPED`, `DELIVERED`, `CANCELLED`)
  - Order management modal: change status, assign courier partner, input AWB tracking number & URL
  - View & print official GST tax invoices
- **Customer Account Management**:
  - Customer search, spending history, and instant Block/Unblock toggle
- **Marketing & Promotions**:
  - Coupon Code manager (percentage/flat, min order value, max discount cap, status)
  - Hero slider & promotional banner manager with link and position assignment
- **Review Moderation**:
  - Approve, Reject, and Delete customer reviews
- **Content Management (CMS)**:
  - Dynamic content editor for static policy pages (About Us, Privacy Policy, Terms, Shipping, Refund)
  - Customer contact enquiries inbox
- **Reports & Analytics**:
  - Sales summary (Revenue, Orders, AOV)
  - Inventory stock level report with CSV export
- **Store & Operational Settings**:
  - Store identity, GSTIN number, address, contact info
  - Free shipping threshold and standard delivery fees
- **Payment Gateway Security Vault (Super Admin Only)**:
  - Razorpay Test / Live mode toggle
  - AES-256 encryption at rest
  - Secrets masked as `????????1234`
  - Step-up re-authentication modal (requires Super Admin password to edit or reveal secrets)
  - Key reveal action permanently recorded in audit logs
- **Staff Accounts & Granular RBAC Permissions Matrix (Super Admin Only)**:
  - Create staff members and assign roles
  - Interactive 11-module &times; 4-action (View/Create/Edit/Delete) permissions matrix
- **System Audit Trail**:
  - Immutable chronological log tracking User, Module, Action, Description, IP Address, and Timestamp

---

## ?? Pre-Configured Test Logins

The database is pre-seeded with authentic catalog items, orders, and user accounts. You can click the quick-fill buttons in the Sign In modal or use the following credentials:

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `superadmin@vortique.test` | `Admin@12345` | Master system control, payment credentials, staff RBAC matrix, audit logs |
| **Admin** | `admin@vortique.test` | `Admin@12345` | Catalog, orders fulfillment, marketing coupons/banners, reviews, CMS |
| **Staff Manager** | `manager@vortique.test` | `Manager@12345` | Products, inventory stock, order packing, view customers/reports |
| **Customer** | `john@example.com` | `Customer@12345` | Browsing, shopping, cart, checkout, saved addresses, order tracking |

---

## ??? Tech Stack & Architecture

- **Frontend**: React 18 (Vite), Tailwind CSS, Lucide React icons, React Router v6, Axios
- **Backend**: Node.js, Express.js REST API (`/api/v1`), JWT authentication (Access & Refresh), Bcrypt, Multer, Morgan
- **Database & ORM**: Prisma ORM with SQLite for zero-config instant local execution, with direct 1-line toggle to MySQL
- **Security**: AES-256-GCM encryption for payment gateway secrets, masked credentials, RBAC route middleware, step-up password verification

---

## ?? Running the Project Locally

### 1. Backend Server
```powershell
cd mobile-accessories-platform/backend
npm install
npx prisma generate
npx prisma db push
node prisma/seed.js
npm start
```
> Running on: `http://localhost:5000`

### 2. Frontend Application
```powershell
cd mobile-accessories-platform/frontend
npm install
npm run dev
```
> Running on: `http://localhost:5173`

---

## ?? Switching from SQLite to MySQL

If you want to use MySQL instead of the default local SQLite database:

1. Start the included MySQL 8 Docker container:
   ```powershell
   docker-compose up -d
   ```
2. In `backend/prisma/schema.prisma`, change datasource provider:
   ```prisma
   datasource db {
     provider = "mysql"
     url      = env("DATABASE_URL")
   }
   ```
3. In `backend/.env`, uncomment the MySQL connection string:
   ```env
   DATABASE_URL="mysql://root:rootpassword@localhost:3306/nexgear_db"
   ```
4. Push schema and re-seed:
   ```powershell
   npx prisma db push
   node prisma/seed.js
   ```
