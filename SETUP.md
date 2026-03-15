# ⚡ Quick Setup Guide

## Option A — Docker Compose (Recommended, Zero Config)

```bash
# 1. Unzip
unzip zomato-clone.zip
cd zomato-clone

# 2. Start everything
docker-compose up --build

# 3. Open browser
open http://localhost        # Full app via Nginx
open http://localhost:4200   # Angular dev server directly
```

That's it. All 6 MongoDB + service containers start automatically.

---

## Option B — Manual (No Docker)

### Step 1 — Start MongoDB locally
Make sure MongoDB is running on `localhost:27017`.

### Step 2 — Backend services
Each service needs its own terminal:

```bash
# Terminal 1 — User Service
cd zomato-clone/user-service
pip install -r requirements.txt
MONGODB_URL=mongodb://localhost:27017 uvicorn main:app --reload --port 8001

# Terminal 2 — Restaurant Service
cd zomato-clone/restaurant-service
pip install -r requirements.txt
MONGODB_URL=mongodb://localhost:27017 uvicorn main:app --reload --port 8002

# Terminal 3 — Order Service
cd zomato-clone/order-service
pip install -r requirements.txt
MONGODB_URL=mongodb://localhost:27017 uvicorn main:app --reload --port 8003
```

### Step 3 — Frontend (Angular)

> ⚠️ You MUST run these commands from inside the `frontend/` folder.

```bash
cd zomato-clone/frontend      # <-- critical: must be in this directory
npm install
npm start
```

The Angular CLI reads `angular.json` from the **current working directory**.
Running `ng serve` or `npm start` from any other directory will cause:
`"no configuration file provided: not found"`

Open http://localhost:4200 — the proxy.conf.json automatically forwards
`/api/users` → 8001, `/api/restaurants` → 8002, `/api/orders` → 8003.

---

## Verify Services Are Running

```bash
curl http://localhost:8001/health   # {"status":"healthy","service":"user-service"}
curl http://localhost:8002/health   # {"status":"healthy","service":"restaurant-service"}
curl http://localhost:8003/health   # {"status":"healthy","service":"order-service"}
```

## API Docs (Swagger UI)
- User Service:       http://localhost:8001/docs
- Restaurant Service: http://localhost:8002/docs
- Order Service:      http://localhost:8003/docs
