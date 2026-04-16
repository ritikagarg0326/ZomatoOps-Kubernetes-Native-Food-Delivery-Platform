# 🍕 Zomato Clone — Full-Stack Food Delivery Platform

A production-grade food delivery platform built with **Angular 17**, **FastAPI microservices**, **MongoDB**, and **Nginx** as API Gateway — containerised with Docker and monitored end-to-end.

---

<div align="center">
  <img src="images/snapshot1.png" width="300"/>
  <img src="images/snapshot2.png" width="300"/>
  <img src="images/snapshot3.png" width="400"/>
  <img src="images/snapshot4.png" width="300"/>
  <img src="images/snapshot5.png" width="300"/>
  <img src="images/snapshot6.png" width="300"/>
  <img src="images/snapshot7.png" width="300"/>
</div>

---

## 🛠️ Tech & DevOps Stack

| Layer | Tool | Role in This Project |
|---|---|---|
| **Frontend** | Angular 17 | Standalone SPA with lazy loading + signals |
| **API Gateway** | Nginx | Routes `/api/*` to correct microservice, serves static files |
| **Backend** | FastAPI × 3 | Independent microservices — user, restaurant, order |
| **Database** | MongoDB × 3 | Isolated DB per service (no shared state) |
| **Containerisation** | Docker + Compose | Single-command local stack, reproducible builds |
| **CI/CD** | GitHub Actions | Build → test → push image on every push to `main` |
| **GitOps** | ArgoCD | Watches Helm chart in Git, auto-deploys to K8s |
| **K8s Packaging** | Helm | Templated manifests, one chart for all environments |
| **Metrics** | Prometheus | Scrapes `/metrics` from all 3 FastAPI services |
| **Dashboards** | Grafana | Order volume, latency, error rate, cart abandonment |

---

## 🔄 CI/CD Pipeline

```mermaid
flowchart TD
    A[fa:fa-code Push to main] --> B[GitHub Actions triggered]
    B --> C[Install deps\npytest + ng build]
    C --> D{Tests pass?}
    D -- No --> E[fa:fa-times Pipeline fails\nnotify developer]
    D -- Yes --> F[docker build\nper service]
    F --> G[Push 3 images\nto registry\ntagged with commit SHA]
    G --> H[Patch helm/values.yaml\nnew image tags]
    H --> I[Commit values.yaml\nback to repo]

    style A fill:#c9d1d9,color:#0d1117
    style B fill:#2ea043,color:#fff
    style C fill:#388bfd,color:#fff
    style D fill:#9e6a03,color:#fff
    style E fill:#da3633,color:#fff
    style F fill:#1f6feb,color:#fff
    style G fill:#1f6feb,color:#fff
    style H fill:#2ea043,color:#fff
    style I fill:#2ea043,color:#fff
```

> Three separate Docker images are built — one per microservice. Each is tagged with the Git commit SHA so you can trace any deployed pod back to an exact commit.

---

## 🚀 GitOps Flow — ArgoCD

```mermaid
flowchart LR
    A[fa:fa-git helm/values.yaml\nupdated in Git] --> B[ArgoCD detects\nout-of-sync]
    B --> C[Render Helm\ntemplates]
    C --> D[kubectl apply\nto cluster]
    D --> E[Rolling update\nper service]
    E --> F[fa:fa-check All pods\nhealthy]

    style A fill:#0d1117,color:#58a6ff,stroke:#30363d
    style B fill:#9e6a03,color:#fff
    style C fill:#6e40c9,color:#fff
    style D fill:#6e40c9,color:#fff
    style E fill:#1f6feb,color:#fff
    style F fill:#2ea043,color:#fff
```

> No `kubectl apply` commands run manually. Git is the single source of truth. Rolling back = reverting a commit.

---

## ☸️ Kubernetes — Helm Chart Layout

```mermaid
flowchart TD
    HC[helm/Chart.yaml] --> V[values.yaml\nimage tags\nreplicas\nenv vars]
    V --> T[templates/]
    T --> D1[user-deployment.yaml]
    T --> D2[restaurant-deployment.yaml]
    T --> D3[order-deployment.yaml]
    T --> SVC[services.yaml\nClusterIP per microservice]
    T --> ING[ingress.yaml\nNginx rules]
    T --> HPA[hpa.yaml\nautoscaling rules]
    T --> CM[configmap.yaml\nnon-secret config]

    style HC fill:#0d1117,color:#f0883e,stroke:#30363d
    style V fill:#0d1117,color:#f0883e,stroke:#30363d
    style T fill:#161b22,color:#cdd9e5,stroke:#30363d
    style D1 fill:#0c2d6b,color:#79c0ff,stroke:#1f6feb
    style D2 fill:#0c2d6b,color:#79c0ff,stroke:#1f6feb
    style D3 fill:#0c2d6b,color:#79c0ff,stroke:#1f6feb
    style SVC fill:#1a3a1a,color:#56d364,stroke:#2ea043
    style ING fill:#1a3a1a,color:#56d364,stroke:#2ea043
    style HPA fill:#1a3a1a,color:#56d364,stroke:#2ea043
    style CM fill:#1a3a1a,color:#56d364,stroke:#2ea043
```

> Same Helm chart is used for `dev`, `staging`, and `prod` — only `values.yaml` changes per environment.

---

## 📊 Monitoring Pipeline

```mermaid
flowchart LR
    subgraph SERVICES["FastAPI Microservices"]
        US[user-service\n:8001/metrics]
        RS[restaurant-service\n:8002/metrics]
        OS[order-service\n:8003/metrics]
    end

    subgraph OBSERVE["Observability Stack"]
        P[Prometheus\nscrapes every 15s]
        G[Grafana\nPromQL dashboards]
        A[Alertmanager\nSlack alerts]
    end

    US --> P
    RS --> P
    OS --> P
    P --> G
    P --> A

    style US fill:#0d419d,color:#79c0ff,stroke:#1f6feb
    style RS fill:#0d419d,color:#79c0ff,stroke:#1f6feb
    style OS fill:#0d419d,color:#79c0ff,stroke:#1f6feb
    style P fill:#7d2000,color:#ffa657,stroke:#e6522c
    style G fill:#7d4000,color:#ffa657,stroke:#f46800
    style A fill:#3d1a00,color:#ffa657,stroke:#9e6a03
```

**Grafana dashboards track:**
- Orders placed per minute / hour
- API response time (p50, p95, p99) per service
- Cart abandonment rate
- MongoDB connection pool usage
- Pod CPU and memory per microservice

---

## 🗺️ Full System Architecture

```mermaid
flowchart TD
    USER([fa:fa-user Browser]) --> NG[Nginx :80\nAPI Gateway\n+ Static Files]

    NG -->|/api/users/*| US[User Service\n:8001]
    NG -->|/api/restaurants/*| RS[Restaurant Service\n:8002]
    NG -->|/api/orders/*| OS[Order Service\n:8003]
    NG -->|/*| FE[Angular SPA\nstatic files]

    US --> UDB[(MongoDB\nuser_db)]
    RS --> RDB[(MongoDB\nrestaurant_db)]
    OS --> ODB[(MongoDB\norder_db)]

    subgraph MON["Monitoring"]
        PROM[Prometheus]
        GRAF[Grafana]
    end

    US -->|/metrics| PROM
    RS -->|/metrics| PROM
    OS -->|/metrics| PROM
    PROM --> GRAF

    style USER fill:#c9d1d9,color:#0d1117
    style NG fill:#0d1117,color:#cdd9e5,stroke:#58a6ff
    style US fill:#0c2d6b,color:#79c0ff,stroke:#1f6feb
    style RS fill:#0c2d6b,color:#79c0ff,stroke:#1f6feb
    style OS fill:#0c2d6b,color:#79c0ff,stroke:#1f6feb
    style FE fill:#1a3a1a,color:#56d364,stroke:#2ea043
    style UDB fill:#1a1a1a,color:#57ab5a,stroke:#2ea043
    style RDB fill:#1a1a1a,color:#57ab5a,stroke:#2ea043
    style ODB fill:#1a1a1a,color:#57ab5a,stroke:#2ea043
    style PROM fill:#7d2000,color:#ffa657,stroke:#e6522c
    style GRAF fill:#7d4000,color:#ffa657,stroke:#f46800
    style MON fill:#1a0e00,color:#cdd9e5,stroke:#9e6a03
```

---

## 🔍 How the Nginx Gateway Works

```nginx
# nginx/nginx.conf — simplified
server {
    listen 80;

    # Serve Angular SPA
    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;   # SPA fallback
    }

    # Route to microservices
    location /api/users/ {
        proxy_pass http://user-service:8001/;
    }
    location /api/restaurants/ {
        proxy_pass http://restaurant-service:8002/;
    }
    location /api/orders/ {
        proxy_pass http://order-service:8003/;
    }
}
```

Angular makes all calls to `/api/*` — it never hardcodes service ports. Nginx handles the routing internally. This means the frontend doesn't change whether running locally or in Kubernetes.

---

## 📁 Project Structure

```
zomato-clone/
├── user-service/          # FastAPI — Auth, JWT, profiles (port 8001)
│   ├── main.py
│   ├── models.py
│   ├── database.py
│   ├── requirements.txt
│   └── Dockerfile
│
├── restaurant-service/    # FastAPI — Restaurants, menus, reviews, photos (port 8002)
│   ├── main.py
│   ├── models.py
│   ├── database.py
│   ├── requirements.txt
│   └── Dockerfile
│
├── order-service/         # FastAPI — Cart, orders, history (port 8003)
│   ├── main.py
│   ├── models.py
│   ├── database.py
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/              # Angular 17 standalone SPA
│   └── src/app/
│       ├── components/
│       │   ├── home/
│       │   ├── auth/
│       │   ├── user-profile/
│       │   ├── order/
│       │   └── restaurant/         # Nested layout with tabs
│       │       ├── restaurant-menu/
│       │       ├── restaurant-photos/
│       │       ├── restaurant-review/
│       │       └── restaurant-order/
│       ├── services/               # API calls, auth, toast
│       ├── guards/                 # Route protection
│       └── models/                 # TypeScript interfaces
│
├── nginx/
│   ├── nginx.conf         # Gateway config
│   └── Dockerfile
│
├── helm/                  # Kubernetes Helm chart
│   ├── Chart.yaml
│   ├── values.yaml
│   └── templates/
│
├── .github/workflows/
│   └── deploy.yml         # CI pipeline
│
└── docker-compose.yml     # Local dev stack
```

---

## ⚡ Quick Start

### Docker Compose (recommended)

```bash
git clone <your-repo>
cd zomato-clone
docker-compose up --build
```

Starts everything — 3 MongoDB instances, 3 FastAPI services, Angular dev server, and Nginx.

| URL | What it opens |
|-----|---------------|
| http://localhost | App via Nginx (production-like) |
| http://localhost:4200 | Angular dev server (hot reload) |
| http://localhost/api/users | User service |
| http://localhost/api/restaurants | Restaurant service |
| http://localhost/api/orders | Order service |

### Without Docker

```bash
# Start each service in a separate terminal
cd user-service && pip install -r requirements.txt && uvicorn main:app --reload --port 8001
cd restaurant-service && pip install -r requirements.txt && uvicorn main:app --reload --port 8002
cd order-service && pip install -r requirements.txt && uvicorn main:app --reload --port 8003

# Frontend
cd frontend && npm install && npm start
```

---

## 📌 API Endpoints

### User Service (`/api/users`)

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| POST | `/register` | ❌ | Register new user |
| POST | `/login` | ❌ | Login, returns JWT |
| GET | `/me` | ✅ | Get current user profile |
| PUT | `/me` | ✅ | Update profile |
| GET | `/validate` | ✅ | Validate JWT (internal use) |

### Restaurant Service (`/api/restaurants`)

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| GET | `/` | ❌ | List + filter restaurants |
| POST | `/` | ✅ | Create restaurant |
| GET | `/{id}` | ❌ | Restaurant details |
| PUT | `/{id}` | ✅ | Update restaurant |
| DELETE | `/{id}` | ✅ | Soft-delete |
| GET/POST | `/{id}/menu` | ❌/✅ | View or add menu items |
| GET/POST | `/{id}/reviews` | ❌/✅ | View or submit reviews |
| GET/POST | `/{id}/photos` | ❌/✅ | View or upload photos |

**Filter params on `GET /`:** `category`, `city`, `search`, `price_range`, `skip`, `limit`

### Order Service (`/api/orders`)

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| GET | `/cart` | ✅ | Get active cart |
| PUT | `/cart` | ✅ | Add / update cart items |
| DELETE | `/cart` | ✅ | Clear cart |
| POST | `/` | ✅ | Place order |
| GET | `/` | ✅ | Order history |
| PATCH | `/{id}/cancel` | ✅ | Cancel order |

---

## ✅ Feature Checklist

**Backend**
- [x] JWT auth with bcrypt hashing across all services
- [x] Restaurant CRUD with owner-only write access
- [x] Menu items with veg/non-veg/vegan flags
- [x] Ratings auto-calculated from submitted reviews
- [x] Cart persisted server-side (survives page refresh)
- [x] Coupon code support at checkout (`WELCOME50`)
- [x] Auto-seeded sample data on first run
- [x] MongoDB indexes for fast filtering queries

**Frontend**
- [x] Angular 17 standalone components + lazy loading
- [x] Angular Signals for reactive cart state
- [x] JWT injected automatically via HTTP interceptor
- [x] Route guards on authenticated pages
- [x] Nested restaurant layout with shared tab navigation
- [x] Lightbox photo gallery
- [x] Multi-step restaurant creation form
- [x] Live cart counter in navbar
- [x] Toast notification system
- [x] Fully responsive — mobile first
- [x] Veg filter on menu page

---

## 🔒 Security Checklist (Before Production)

- [ ] Replace `SECRET_KEY` in all 3 services with a 32+ character random string
- [ ] Enable MongoDB authentication and use credentialed connection strings
- [ ] Add HTTPS via Nginx + Certbot (Let's Encrypt)
- [ ] Set strict `CORS` origins — remove wildcard

---

## 🧪 Test Data

5 sample restaurants are seeded automatically on first run.

**Test coupon:** `WELCOME50` — 50% off, max ₹100 discount

---

## 📦 Production Build

```bash
cd frontend
npm run build
# Output goes to: frontend/dist/zomato-clone/browser/
# Copy this into the nginx Dockerfile's COPY step

docker-compose up --build
```
