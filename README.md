# Invoice App

A full-stack invoice management app for freelancers — create clients, generate professional invoices with line items and tax calculations, track payment status, and export invoices as PDF.

**Live demo:** https://invoice-app-freelancers.netlify.app
**Backend API:** https://invoice-app-swe1.onrender.com/api/health

> Note: the backend is hosted on Render's free tier, which spins down after inactivity — the first request after idle time may take 30-50 seconds to respond.

## Features

- User authentication (signup/login) with JWT
- Client management (create, edit, delete)
- Invoice creation with dynamic line items and automatic tax/total calculation
- Per-user auto-incrementing invoice numbers (INV-0001, INV-0002...)
- Invoice status tracking (Draft, Sent, Paid, Overdue)
- PDF export/download for any invoice
- Dashboard with outstanding balance and recent invoice summary
- All data scoped per user — full multi-tenant data isolation

## Tech Stack

**Frontend:** React (Vite), React Router, Tailwind CSS, Axios
**Backend:** Node.js, Express, JWT, bcrypt
**Database:** PostgreSQL (Supabase), Prisma ORM
**PDF Generation:** PDFKit
**Deployment:** Netlify (frontend), Render (backend)

## Screenshots

<!-- Add screenshots here — see instructions below -->

## Getting Started Locally

### Prerequisites
- Node.js (v18+)
- A PostgreSQL database (e.g. free tier on Supabase)

### Setup

1. Clone the repo:
```bash
   git clone https://github.com/Ngwa-Tech/invoice-app.git
   cd invoice-app
```

2. **Backend setup:**
```bash
   cd backend
   npm install
```
   Create a `.env` file in `backend/`:

      Run migrations and start the server:
```bash
   npx prisma migrate dev
   npm run dev
```

3. **Frontend setup** (in a new terminal):
```bash
   cd frontend
   npm install
   npm run dev
```
   The app will be available at `http://localhost:5173`.

## Project Structure
invoice-app/
├── frontend/ # React app (Vite)
├── backend/ # Express API
│ ├── src/
│ │ ├── routes/ # auth, clients, invoices
│ │ ├── middleware/
│ │ └── prismaClient.js
│ └── prisma/
│ └── schema.prisma


## What I Learned

Built to strengthen practical full-stack skills: relational database design with Prisma (including per-user unique constraints), JWT-based auth and route protection, nested data creation (invoices with line items), server-side PDF generation, and deploying a full-stack app across separate frontend/backend hosts with environment-based configuration.