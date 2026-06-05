# Wedding Hall Frontend

Premium React + TypeScript frontend for the Wedding Hall booking platform.

## Stack

- React 19 + TypeScript + Vite
- React Router
- Axios
- Tailwind CSS v4
- react-hot-toast

## Run

```bash
# Terminal 1 — backend (port 5000)
cd backend && npm run dev

# Terminal 2 — frontend (port 3000)
cd frontend && npm run dev
```

Backend `FRONTEND_URL` should include `http://localhost:3000` (see `backend/.env.example`).

### Admin / Owner login

Login accepts **phone**, **email**, or **username**.

Set dev passwords once:

```bash
cd backend && npm run seed:dev-auth
```

| Role  | Login              | Password   |
|-------|--------------------|------------|
| Admin | `admin@wedding.uz` | `Admin1234` |
| Owner | `jasur01`          | `Owner1234` |

API calls use Vite proxy: `/api` → `http://localhost:5000`.

## Structure

```
src/
  components/   # UI + VenueCard
  contexts/     # AuthContext
  layouts/      # Public, Auth, Dashboard
  pages/        # Route pages
  routes/       # Router + ProtectedRoute
  services/     # API layer (all backend endpoints)
  types/
  utils/
```

## Roles

| Role  | Dashboard   | Features                          |
|-------|-------------|-----------------------------------|
| user  | /dashboard  | Browse venues, create bookings    |
| owner | /owner      | Manage venues, view bookings      |
| admin | /admin      | Stats, approve venues, all data   |

## Venue management (`/venues/:id/manage`)

Owner/Admin can manage per venue:

- **Rasmlar** — upload, delete, set primary
- **Qo'shiqchilar** — CRUD + image
- **Menyu** — CRUD + image
- **Mashinalar** — CRUD + image
- **Karnay-surnay** — enable + price
- **Kalendar** — availability view

Users book via interactive calendar on `/bookings/new/:venueId`.
