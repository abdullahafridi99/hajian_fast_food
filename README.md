# HAJIAN FOODS - Premium Fast Food Website & Admin Panel

A premium, responsive, production-ready MERN (MongoDB, Express, React, Node.js) web application for **HAJIAN FOODS**, equipped with a complete, secure Admin Dashboard managing all content dynamically (CRUD) and an online local payment verification system (EasyPaisa, JazzCash, Bank Transfer).

---

## 🚀 Getting Started

### 📋 Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed (v18+ recommended).

### 🛠️ Setup Instructions

#### 1. Configure the Database
By default, the backend tries to connect to a local MongoDB instance (`mongodb://localhost:27017/hajian_foods`).
To connect to MongoDB Atlas, create/edit the `.env` file in the `backend/` directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=hajian_secret_key_123
NODE_ENV=development
```

#### 2. Seed Initial Data
To populate the database with default categories, initial food items, sample deals, testimonials, and the default admin account:
1. Open a terminal and navigate to the `backend/` directory.
2. Run the seed script:
   ```bash
   npm run seed
   ```

#### 3. Start the Backend Server
1. Navigate to the `backend/` directory.
2. Start the API gateway:
   ```bash
   npm start
   ```
   *(Server starts on `http://localhost:5000`)*

#### 4. Start the Frontend Development Server
1. Open a new terminal and navigate to the `frontend/` directory.
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Start the Vite React development server:
   ```bash
   npm run dev
   ```
   *(Server starts on `http://localhost:5173` or similar. Calls to `/api` are automatically proxied to the backend)*

---

## 🔒 Default Admin Credentials
Log in to the Admin Dashboard via the **Admin Login** link in the header or directly at `/admin/login`:
- **Username**: `admin`
- **Password**: `admin123`

---

## 📂 Project Directory Structure

```
hajian-foods/
├── backend/
│   ├── config/             # Database connection configuration
│   ├── middleware/         # Admin JWT auth protectors
│   ├── models/             # Mongoose schemas (Admins, Foods, Categories, Orders, Settings, Payments, Gallery, Testimonials)
│   ├── routes/             # Express API gateways
│   ├── scripts/            # Database seeding script (seed.js)
│   ├── uploads/            # Static local image uploads directory
│   ├── .env                # Port, secret key, and database URI configurations
│   ├── server.js           # Server initializer
│   └── package.json
├── frontend/
│   ├── public/             # Static web resources
│   ├── src/
│   │   ├── components/     # Reusable layout components (Navbar, Footer, FoodCard, DealCard, StatusBadge)
│   │   ├── context/        # React global state managers (Auth, Cart, Settings)
│   │   ├── pages/          # Public facing pages (Home, About, Menu, Deals, Gallery, Testimonials, Contact, Cart, Checkout)
│   │   │   └── admin/      # Admin console pages (Layout, Dashboard, Foods, Categories, Deals, Orders, Payments, settings)
│   │   ├── App.jsx         # Router maps & layouts loader
│   │   ├── index.css       # Tailwind CSS & glassmorphic custom rules
│   │   └── main.jsx
│   ├── index.html          # SEO tags preloads & Outfit google fonts loader
│   ├── tailwind.config.js  # Theme variables (Primary, Secondary, Accent, Dark slate)
│   ├── vite.config.js      # CORS Proxy configuration
│   └── package.json
└── README.md
```

---

## 💡 Key Full-Stack Features

1. **Online Ordering Flow**: Add to cart, adjust quantities, review delivery pricing calculations, input coordinates, and checkout.
2. **Local Payment Verification**: Digital transfer modes (EasyPaisa, JazzCash, Bank Transfer) display dynamic details and scan QR codes. Integrates a screenshot file uploader for receipts.
3. **Admin Dashboard (CRUD)**: Manage categories, food menus, promotions, and dining gallery photos. Update prices, descriptions, and toggle item availability triggers dynamically.
4. **Interactive Order Pipeline**: Follow order progressions (Pending ➔ Preparing ➔ Out for Delivery ➔ Delivered) in real-time. Verify transaction proof screenshots before accepting orders.
5. **No-Code Web Settings Editor**: Modify restaurant details, whatsapp links, email headers, custom slogans, and landing page banner text dynamically without touch database or source codes.
6. **Robust Warning System**: Safe connection fallbacks warn rather than crash if MongoDB is not active on startup.
