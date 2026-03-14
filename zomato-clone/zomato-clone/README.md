# 🍕 Zomato Clone — Full-Stack Food Delivery Platform

A production-grade food delivery and discovery platform built with **Angular 17**, **FastAPI** (3 microservices), **MongoDB**, and **Nginx** as the API Gateway.

---

## 📁 Project Structure

```
zomato-clone/
├── user-service/          # FastAPI — Auth, JWT, User profiles (port 8001)
│   ├── main.py
│   ├── models.py
│   ├── database.py
│   ├── requirements.txt
│   └── Dockerfile
│
├── restaurant-service/    # FastAPI — Restaurant CRUD, menus, reviews, photos (port 8002)
│   ├── main.py
│   ├── models.py
│   ├── database.py
│   ├── requirements.txt
│   └── Dockerfile
│
├── order-service/         # FastAPI — Cart management, order placement, history (port 8003)
│   ├── main.py
│   ├── models.py
│   ├── database.py
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/              # Angular 17 standalone app
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   │   ├── home/                  # Landing page
│   │   │   │   ├── dining/                # Dining category listing
│   │   │   │   ├── nightlife/             # Nightlife listing
│   │   │   │   ├── get-the-app/           # App download promo
│   │   │   │   ├── auth/                  # Login & Register
│   │   │   │   ├── user-profile/          # Profile + order history
│   │   │   │   ├── add-restaurant/        # Multi-step restaurant form
│   │   │   │   ├── order/                 # Checkout page
│   │   │   │   └── restaurant/            # Restaurant nested views:
│   │   │   │       ├── restaurant-layout.component   # Parent with tabs
│   │   │   │       ├── restaurant-home/              # Overview
│   │   │   │       ├── restaurant-menu/              # Menu with veg filter
│   │   │   │       ├── restaurant-photos/            # Photo gallery + lightbox
│   │   │   │       ├── restaurant-review/            # Reviews + submit form
│   │   │   │       └── restaurant-order/             # Add-to-cart interface
│   │   │   ├── services/
│   │   │   │   ├── auth.service.ts        # Login, register, JWT storage
│   │   │   │   ├── restaurant.service.ts  # Restaurant API calls
│   │   │   │   ├── order.service.ts       # Cart + order API calls
│   │   │   │   ├── auth.interceptor.ts    # HTTP Bearer token injector
│   │   │   │   └── toast.service.ts       # In-app toast notifications
│   │   │   ├── guards/
│   │   │   │   └── auth.guard.ts          # Route protection
│   │   │   ├── models/
│   │   │   │   └── models.ts              # TypeScript interfaces
│   │   │   ├── app.routes.ts              # All routes with lazy loading
│   │   │   ├── app.config.ts              # App providers
│   │   │   ├── app.component.ts/html/scss # Root component with nav+footer
│   │   └── styles.scss                    # Global design tokens + utilities
│   ├── angular.json
│   ├── tsconfig.json
│   └── package.json
│
├── nginx/
│   ├── nginx.conf         # API Gateway + SPA serving config
│   └── Dockerfile
│
├── docker-compose.yml     # Full local stack orchestration
└── README.md
```

---

## 🏗️ Architecture

```
Browser (Angular SPA)
        │
        ▼
   ┌──────────┐
   │  Nginx   │  :80  — Serves Angular static files
   │ Gateway  │        — Reverse proxies API routes
   └──┬───┬───┘
      │   │
  ┌───┘   └──────────────────────┐
  │                               │
  ▼                               ▼
/api/users/*            /api/restaurants/*      /api/orders/*
  │                               │                    │
  ▼                               ▼                    ▼
User Service            Restaurant Service      Order Service
 (port 8001)              (port 8002)            (port 8003)
     │                        │                       │
     ▼                        ▼                       ▼
 MongoDB                  MongoDB                  MongoDB
 (user_db)           (restaurant_db)             (order_db)
```

---

## 🚀 Quick Start (Docker Compose)

### Prerequisites
- Docker & Docker Compose installed
- Node.js 20+ (for local Angular dev without Docker)

### 1. Clone & Start Everything

```bash
git clone <your-repo>
cd zomato-clone
docker-compose up --build
```

This starts:
- 3 MongoDB instances (ports not exposed externally)
- 3 FastAPI microservices
- Angular dev server on `:4200`
- Nginx gateway on `:80`

### 2. Access the App

| Service | URL |
|---------|-----|
| Frontend (via Nginx) | http://localhost |
| Frontend (dev server) | http://localhost:4200 |
| User Service API | http://localhost/api/users |
| Restaurant Service API | http://localhost/api/restaurants |
| Order Service API | http://localhost/api/orders |

---

## 🔧 Local Development (Without Docker)

### Backend Services

```bash
# User Service
cd user-service
pip install -r requirements.txt
uvicorn main:app --reload --port 8001

# Restaurant Service
cd restaurant-service
pip install -r requirements.txt
uvicorn main:app --reload --port 8002

# Order Service
cd order-service
pip install -r requirements.txt
uvicorn main:app --reload --port 8003
```

### Frontend

```bash
cd frontend
npm install
npm start
# App runs at http://localhost:4200
```

> **Note:** For local dev without Docker, update the API base URL in `angular.json` or add a proxy config.

---

## 📌 API Endpoints

### User Service (`/api/users`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register` | ❌ | Register new user |
| POST | `/login` | ❌ | Login, returns JWT |
| GET | `/me` | ✅ | Get current user profile |
| PUT | `/me` | ✅ | Update profile |
| GET | `/validate` | ✅ | Validate JWT (internal) |

### Restaurant Service (`/api/restaurants`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | ❌ | List restaurants (filterable) |
| POST | `/` | ✅ | Create restaurant |
| GET | `/{id}` | ❌ | Get restaurant details |
| PUT | `/{id}` | ✅ | Update restaurant |
| DELETE | `/{id}` | ✅ | Soft-delete restaurant |
| GET | `/{id}/menu` | ❌ | Get menu items |
| POST | `/{id}/menu` | ✅ | Add menu item |
| GET | `/{id}/reviews` | ❌ | Get reviews |
| POST | `/{id}/reviews` | ✅ | Submit review |
| GET | `/{id}/photos` | ❌ | Get photos |
| POST | `/{id}/photos` | ✅ | Add photo |

**Query params for `GET /`:** `category`, `city`, `search`, `price_range`, `skip`, `limit`

### Order Service (`/api/orders`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/cart` | ✅ | Get current cart |
| PUT | `/cart` | ✅ | Upsert cart |
| DELETE | `/cart` | ✅ | Clear cart |
| POST | `/` | ✅ | Place order |
| GET | `/` | ✅ | Order history |
| GET | `/{id}` | ✅ | Get single order |
| PATCH | `/{id}/cancel` | ✅ | Cancel order |

---

## 🎯 Key Features

### Backend
- ✅ JWT authentication with bcrypt password hashing
- ✅ Full CRUD for restaurants with owner verification
- ✅ Menu management with vegetarian/vegan flags
- ✅ Photo gallery management
- ✅ Rating auto-calculation from reviews
- ✅ Cart state with server persistence
- ✅ Order placement with coupon support (`WELCOME50`)
- ✅ Automatic sample data seeding on first run
- ✅ Index creation for optimized queries

### Frontend
- ✅ Angular 17 standalone components with lazy loading
- ✅ Angular Signals for reactive state management
- ✅ JWT stored in localStorage, injected via HTTP interceptor
- ✅ Route guards for authenticated pages
- ✅ Nested restaurant routes with shared layout
- ✅ Lightbox photo gallery
- ✅ Multi-step restaurant creation form
- ✅ Real-time cart counter in navbar
- ✅ Toast notification system
- ✅ Fully responsive (mobile-first)
- ✅ Veg/non-veg filter on menu
- ✅ Coupon code support at checkout

---

## 🔐 Security Notes

> **Important:** Change these before deploying to production:

1. `SECRET_KEY` in all services — set a strong 32+ character random string
2. MongoDB — enable authentication and use connection strings with credentials
3. Nginx — add HTTPS/TLS termination (e.g. with Certbot)
4. Set `CORS` policies if serving from a different domain

---

## 🧪 Test Credentials (Sample Data)

The restaurant service auto-seeds 5 sample restaurants on first run. Register any account to start using the platform immediately.

**Test coupon code:** `WELCOME50` (50% off, max ₹100)

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Angular 17, TypeScript, SCSS, Angular Signals |
| API Gateway | Nginx 1.25 |
| User Service | FastAPI, Motor (async MongoDB), python-jose, passlib |
| Restaurant Service | FastAPI, Motor, python-jose |
| Order Service | FastAPI, Motor, python-jose |
| Database | MongoDB 7 (3 isolated instances) |
| Containerization | Docker, Docker Compose |

---

## 📦 Building for Production

```bash
# Build Angular for production
cd frontend
npm run build
# Output: frontend/dist/zomato-clone/browser/

# Copy built files into nginx container
# (Update nginx/Dockerfile to COPY the dist folder)

# Then build and run
docker-compose up --build
```
