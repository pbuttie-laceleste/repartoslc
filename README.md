# WebApp de reposición por objetivos

Proyecto dividido en **backend** (API Express) y **frontend** (React + Vite). Calcula reposiciones según objetivos de stock y equivalencias entre unidades de venta y fabricación.

## Requisitos
- Node.js 18+
- npm

## Instalación
1. Configurá las variables:
   - `backend/.env` → PORT, DATABASE_URL de Postgres (viene con placeholders)
   - `frontend/.env` → `VITE_API_BASE_URL=/api` (para dev usa el proxy)
2. Instalá y corré:
```bash
cd backend
npm install
npm run dev # API en http://localhost:4000
```
En otra terminal:
```bash
cd frontend
npm install
npm run dev # Front en http://localhost:5173
```
El front tiene proxy a `/api`, por lo que la API debe estar corriendo en el puerto 4000.

## Estructura de carpetas
```
backend/
  src/
    data/store.js         // datos mock
    utils/calculations.js // lógica de equivalencias
    server.js             // endpoints REST
frontend/
  src/App.jsx             // UI principal
  src/styles.css
```

## Endpoints principales
- `GET /api/families`
- `GET /api/items`
- `GET /api/stores`
- `POST /api/stores/:storeId/stock-snapshots`
- `GET /api/stock-targets`
- `POST /api/replenishments/calculate`

Los datos se mantienen en memoria (archivo `store.js`) para simplificar la demo. Podés reemplazarlo por una base de datos real adaptando las funciones de lectura/escritura.

## Deploy rápido
1. Instalá dependencias y generá el build del front:
   ```bash
   cd backend && npm install && cd ..
   cd frontend && npm install && npm run build
   ```
2. Deploy backend (por ej. Railway, Render) ejecutando `npm start` en `/backend`.
3. Serví el build del frontend (carpeta `frontend/dist`) en Netlify/Vercel o el mismo servidor.

Listo para subirse a GitHub: solo hacé `git init`, agregá ambos directorios y subí el repo.
