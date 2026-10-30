# Publicar en Vercel (React + Neon)

Stack: **React (Vite)** + **API Node** en `/api` + **Postgres (Neon)**.

---

## 1. Neon (base de datos)

1. [neon.tech](https://neon.tech) → crear proyecto.
2. Copiar **Connection string** (`postgres://...`).
3. En Vercel la variable se llama **`DATABASE_URL`**.

Al primer request se crean tablas y eventos demo.

---

## 2. GitHub

```bash
cd Terapia-Ancianos
git init
git add .
git commit -m "React + API Vercel"
git remote add origin TU_REPO
git push -u origin main
```

---

## 3. Vercel

1. Importar repo en [vercel.com](https://vercel.com).
2. Framework: **Other** (usa `vercel.json`).
3. Variables de entorno:

| Variable | Valor |
|----------|--------|
| `DATABASE_URL` | Connection string de Neon |
| `ADMIN_USER` | `admin` |
| `ADMIN_PASS` | contraseña fuerte |
| `ADMIN_JWT_SECRET` | texto largo aleatorio (opcional) |

4. **Deploy**.

URLs:
- Sitio: `/`
- Admin: `/admin/login`

---

## 4. Desarrollo local

Una sola terminal (React + API; necesitás `DATABASE_URL` en `.env`):

```bash
npm install
cp .env.example .env
# Editá .env y pegá DATABASE_URL de Neon
npm run dev:local
```

Abrí **http://localhost:3001** (Vite y `/api` juntos). No uses `npm run dev` en la raíz dentro de otro `vercel dev` (provoca error recursivo).

---

## Estructura

| Carpeta | Qué es |
|---------|--------|
| `client/` | App React |
| `api/` | Funciones serverless (reservas, eventos, admin) |
| `legacy-php/` | PHP viejo (solo referencia, no se usa en Vercel) |
