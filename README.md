# Espacio Calma — Terapia con adultos mayores

Sitio **React** con reservas, eventos grupales, experiencias y panel admin.

## Stack

- **Frontend:** React + Vite + React Router (`client/`)
- **Backend:** Vercel Serverless Functions (`api/`)
- **Base de datos:** Neon Postgres (`DATABASE_URL`)

El código PHP anterior está en `legacy-php/` (ya no se usa en producción).

## Desarrollo local

1. Creá `.env` desde `.env.example` con tu `DATABASE_URL` de Neon.
2. `npm run dev:local` (o `npx vercel dev --listen 3001`)
3. Abrí http://localhost:3001

## Publicar en Vercel

Ver **[DEPLOY-VERCEL.md](DEPLOY-VERCEL.md)**.

## Rutas

| Ruta | Descripción |
|------|-------------|
| `/` | Inicio |
| `/reservar` | Sesión individual |
| `/eventos` | Talleres grupales |
| `/experiencias` | Historias |
| `/admin/login` | Panel administrador |
