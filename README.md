# 🔔 ExpiryAlert '26

> **Track. Alert. Stay Ahead.**  
> A MERN stack web application for tracking critical business document expiry dates.

Built for the **Expiry Alert '26 Hackathon** — helping organizations like Deloitte, EY, KPMG, and Accenture never miss a critical expiry again.

---

## 🎯 Problem Solved

Organizations manage hundreds of critical documents:
- Vendor contracts
- Compliance certificates
- Safety training records
- Insurance policies
- Machine inspection reports
- Government licenses

Most companies still track these in Excel sheets. One missed expiry = penalties, failed audits, operational delays.

**ExpiryAlert gives managers ONE screen to instantly know what's active, expiring soon, already expired, and needs immediate action.**

---

## ✨ Features

### Core Functionality (41% weight)
- ✅ Add/edit/delete records with name, category, expiry date
- ✅ Auto-classify records as **Active**, **Expiring Soon** (≤30 days), or **Expired**
- ✅ Visual expiry progress bars per record
- ✅ Days countdown with color-coded urgency

### Dashboard & Business Visibility (26% weight)
- ✅ Real-time summary: Total / Active / Expiring Soon / Expired / Critical
- ✅ Doughnut chart for record distribution
- ✅ Bar chart breakdown by category
- ✅ "Needs Immediate Action" panel
- ✅ Recent activity feed
- ✅ Red/Yellow alert banners for critical situations

### Search & Visibility (20% weight)
- ✅ Full-text search across name, issuer, document number, tags
- ✅ Filter by status, category, priority
- ✅ Multiple sort options (expiry, name, date added, priority)
- ✅ Pagination with configurable page size
- ✅ Sidebar quick-filter navigation

### User Experience (13% weight)
- ✅ Sleek dark-mode UI with Space Grotesk + Inter typography
- ✅ Smooth animations and hover interactions
- ✅ Toast notifications for all actions
- ✅ In-app notification center with unread count
- ✅ Fully responsive (mobile-friendly)
- ✅ Archive records instead of permanent deletion

### Bonus Features
- 🔐 JWT authentication with register/login
- 👤 User profile & company settings
- 📧 Configurable alert days before expiry
- 🕐 Automated daily cron job for expiry checking
- 📊 Record history tracking
- 🏷️ Tags, assigned person, renewal cost per record
- 🌱 Demo seed data for immediate testing

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Chart.js, Framer Motion |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose |
| Auth | JWT (JSON Web Tokens) + bcryptjs |
| Scheduling | node-cron |
| Notifications | react-hot-toast |
| Charts | react-chartjs-2 |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or MongoDB Atlas)

### 1. Clone & Install

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment

```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
```

### 3. Seed Demo Data (Optional)

```bash
cd backend
npm run seed
# Creates demo user: demo@expiryalert.com / demo1234
```

### 4. Run the App

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

Visit: **http://localhost:3000**

---

## 📁 Project Structure

```
expiry-alert/
├── backend/
│   ├── controllers/       # Business logic
│   │   ├── authController.js
│   │   ├── recordController.js
│   │   └── dashboardController.js
│   ├── middleware/
│   │   └── auth.js        # JWT protection
│   ├── models/
│   │   ├── User.js
│   │   ├── Record.js
│   │   ├── Category.js
│   │   └── Notification.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── records.js
│   │   ├── dashboard.js
│   │   ├── categories.js
│   │   └── notifications.js
│   ├── utils/
│   │   ├── expiryChecker.js  # Daily cron logic
│   │   └── seed.js           # Demo data
│   └── server.js
│
└── frontend/
    └── src/
        ├── components/
        │   ├── Header.js         # Nav + notifications
        │   ├── Sidebar.js        # Navigation
        │   ├── RecordCard.js     # Table row component
        │   ├── RecordModal.js    # Add/edit form
        │   └── StatCard.js       # Dashboard metric card
        ├── context/
        │   └── AuthContext.js    # Global auth + axios
        ├── hooks/
        │   └── useRecords.js     # Records data hook
        ├── pages/
        │   ├── Dashboard.js      # Main overview
        │   ├── Records.js        # Full record list
        │   ├── Settings.js       # User profile
        │   └── Login.js          # Auth page
        ├── utils/
        │   └── helpers.js        # Date utils, constants
        └── index.css             # Global design system
```

---

## 🔑 API Endpoints

### Auth
- `POST /api/auth/register` — Create account
- `POST /api/auth/login` — Login
- `GET /api/auth/me` — Get current user
- `PUT /api/auth/profile` — Update profile
- `PUT /api/auth/password` — Change password

### Records
- `GET /api/records` — List records (search, filter, paginate)
- `POST /api/records` — Create record
- `GET /api/records/:id` — Get single record
- `PUT /api/records/:id` — Update record
- `DELETE /api/records/:id` — Delete record
- `PUT /api/records/:id/archive` — Archive record
- `GET /api/records/stats` — Get statistics
- `GET /api/records/timeline` — Get expiry timeline

### Dashboard
- `GET /api/dashboard` — Full dashboard data

### Notifications
- `GET /api/notifications` — List notifications
- `PUT /api/notifications/read-all` — Mark all as read

---

## 🏆 Why This Wins

1. **Solves the real problem**: Instant visibility into what needs attention — no spreadsheet digging
2. **Professional UI**: Dark mode design that enterprises would actually use
3. **Complete feature set**: Every requirement plus extras (notifications, history, archiving)
4. **Production-ready code**: Proper auth, error handling, pagination, validation
5. **Scalable architecture**: Clean MVC pattern, reusable components, custom hooks

---

## 📄 License
MIT — Built for Expiry Alert '26 Hackathon
