# Reforma Pro - Quick Start (5 Minutes)

## 🚀 INICIO RÁPIDO - WINDOWS (Recomendado)

### Método más fácil - Un solo doble clic:

1. **Haz doble clic en `iniciar.bat`** en la carpeta del proyecto
2. Espera a que se abran dos ventanas negras (Backend y Frontend)
3. El navegador se abrirá automáticamente en http://localhost:5173

**¡Eso es todo!** La aplicación está lista para usar.

### Para detener la aplicación:
- **Opción 1**: Haz doble clic en `stop.bat`
- **Opción 2**: Cierra las dos ventanas negras (Backend y Frontend)

---

## Option 1: Using Docker (Recommended)

### 1. Start Database & Redis
```bash
docker-compose up -d
```

This starts:
- PostgreSQL on port 5432
- Redis on port 6379
- Adminer (DB GUI) on port 8080

### 2. Setup Backend
```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env - Update these lines:
# DATABASE_URL="postgresql://reforma:reforma_dev_password@localhost:5432/reforma_pro"
# REDIS_URL="redis://localhost:6379"

# Generate JWT secrets
echo "JWT_SECRET=$(openssl rand -base64 32)" >> .env
echo "JWT_REFRESH_SECRET=$(openssl rand -base64 32)" >> .env

# Generate Prisma Client
npm run generate

# Run migrations
npm run migrate

# Seed demo data
npm run db:seed

# Start server
npm run dev
```

### 3. Setup Frontend
```bash
# In a new terminal
cd frontend

# Install dependencies
npm install

# Create .env
cp .env.example .env

# Start dev server
npm run dev
```

### 4. Open Browser
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- Database GUI: http://localhost:8080

### 5. Login
- Email: `worker@demo.com`
- Password: `worker123`

---

## Option 2: Without Docker

### Prerequisites
Install these first:
- [PostgreSQL 15+](https://www.postgresql.org/download/)
- [Redis 7+](https://redis.io/download/)
- [Node.js 20+](https://nodejs.org/)

### 1. Start Services
```bash
# Start PostgreSQL (varies by OS)
# macOS: brew services start postgresql
# Windows: PostgreSQL service should auto-start
# Linux: sudo systemctl start postgresql

# Start Redis
redis-server

# Verify they're running
pg_isready
redis-cli ping
```

### 2. Create Database
```bash
createdb reforma_pro
# or
psql -U postgres -c "CREATE DATABASE reforma_pro;"
```

### 3. Follow Steps 2-5 from Option 1

---

## Common Issues

### "Port 5432 already in use"
PostgreSQL is already running. Skip step 1 and continue.

### "Port 6379 already in use"
Redis is already running. Skip step 1 and continue.

### "Cannot connect to database"
Check DATABASE_URL in backend/.env matches your PostgreSQL credentials.

### "Module not found"
Run `npm install` in both backend and frontend folders.

---

## What You'll See

### Login Page
- Professional olive green design
- Demo credentials displayed
- Smooth animations

### Upload Interface
- 4-step wizard:
  1. Project info
  2. Before photos (drag & drop)
  3. After photos (drag & drop)
  4. Processing

### Presentation View
- Interactive before/after slider
- Beautiful image galleries
- AI-enhanced description
- Professional layout

---

## Stop Services

### If using Docker:
```bash
docker-compose down
```

### If not using Docker:
```bash
# Stop backend: Ctrl+C in terminal
# Stop frontend: Ctrl+C in terminal
# Stop PostgreSQL: brew services stop postgresql (macOS)
# Stop Redis: redis-cli shutdown
```

---

## Next Steps

1. ✅ Play with the UI
2. 📖 Read [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) for full details
3. 🎨 Check [VISUAL_PREVIEW.md](VISUAL_PREVIEW.md) for design guide
4. 🏗️ See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for technical details
5. 🚀 Start implementing API connections (see TODO in PROJECT_SUMMARY.md)

---

## Demo Accounts

| Role   | Email              | Password   |
|--------|-------------------|------------|
| Worker | worker@demo.com   | worker123  |
| Admin  | admin@demo.com    | admin123   |

---

## Useful Commands

```bash
# Backend
cd backend
npm run dev          # Start dev server
npm run db:studio    # Open Prisma Studio (DB GUI)
npm run migrate      # Run migrations
npm run db:seed      # Seed demo data

# Frontend
cd frontend
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build

# Database
docker-compose exec postgres psql -U reforma reforma_pro  # Access DB
```

---

## Support

- **Issues**: GitHub Issues
- **Documentation**: See /docs folder
- **Architecture**: docs/ARCHITECTURE.md

---

**You're ready to go! 🚀**

Open http://localhost:5173 and start exploring.
