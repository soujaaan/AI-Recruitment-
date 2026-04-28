# Frontend Setup

## Environment Variables (.env)

```
VITE_API_URL=/api/v1
```

**Purpose:** Proxies all `/api/*` requests from Vite dev server (localhost:5173) → Backend (localhost:8000)

## Development Flow

1. Backend: `cd backend && npm run dev` (port 8000)
2. Frontend: `cd frontend && npm run dev` (port 5173)  
3. API calls use relative `/api/v1/*` → auto-proxy ✓

## Production Build
```
npm run build
```
VITE_API_URL replaced by backend full URL in deployment.

