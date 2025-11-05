# Reforma Pro - Setup Guide

This guide will help you get Reforma Pro running on your local machine in under 10 minutes.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 20+** - [Download here](https://nodejs.org/)
- **PostgreSQL 15+** - [Download here](https://www.postgresql.org/download/)
- **Redis 7+** - [Download here](https://redis.io/download/)
- **Git** - [Download here](https://git-scm.com/)
- **npm or pnpm** - Comes with Node.js

## Quick Start

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd reforma-pro
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your configuration
# At minimum, set:
# - DATABASE_URL
# - REDIS_URL
# - JWT_SECRET (generate with: openssl rand -base64 32)
# - JWT_REFRESH_SECRET (generate with: openssl rand -base64 32)
# - CLAUDE_API_KEY (get from https://console.anthropic.com)
# - AWS credentials (for Cloudflare R2 or AWS S3)

# Generate Prisma Client
npm run generate

# Run database migrations
npm run migrate

# Seed database with demo data
npm run db:seed

# Start development server
npm run dev
```

The backend API will be running at http://localhost:3000

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env
# Set VITE_API_URL=http://localhost:3000/api/v1

# Start development server
npm run dev
```

The frontend will be running at http://localhost:5173

### 4. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **API Health Check**: http://localhost:3000/health
- **Prisma Studio** (Database GUI): `cd backend && npm run db:studio`

### Demo Credentials

After running the seed command, you can login with:

- **Admin**: `admin@demo.com` / `admin123`
- **Worker**: `worker@demo.com` / `worker123`

## Environment Variables Reference

### Backend (.env)

```env
# Required
NODE_ENV=development
PORT=3000
DATABASE_URL="postgresql://user:password@localhost:5432/reforma_pro"
REDIS_URL="redis://localhost:6379"
JWT_SECRET=<generate-with-openssl>
JWT_REFRESH_SECRET=<generate-with-openssl>
CLAUDE_API_KEY=sk-ant-your-key
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_BUCKET_NAME=reforma-pro-images
AWS_REGION=auto
AWS_ENDPOINT=https://your-account.r2.cloudflarestorage.com

# Optional (defaults shown)
API_VERSION=v1
CORS_ORIGIN=http://localhost:5173
RATE_LIMIT_MAX_REQUESTS=100
MAX_FILE_SIZE=10485760
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:3000/api/v1
VITE_APP_NAME=Reforma Pro
```

## Database Setup

### Using Local PostgreSQL

```bash
# Create database
createdb reforma_pro

# Or using psql
psql -U postgres
CREATE DATABASE reforma_pro;
\q
```

### Using Docker

```bash
# Run PostgreSQL + Redis
docker-compose up -d postgres redis

# The services will be available at:
# PostgreSQL: localhost:5432
# Redis: localhost:6379
```

## Common Issues & Solutions

### Issue: "Cannot connect to database"

**Solution**: Ensure PostgreSQL is running and the DATABASE_URL is correct.

```bash
# Check if PostgreSQL is running
pg_isready

# Or on Windows:
pg_isready -h localhost -p 5432
```

### Issue: "Redis connection refused"

**Solution**: Ensure Redis is running.

```bash
# Start Redis (macOS/Linux)
redis-server

# Check connection
redis-cli ping
# Should return: PONG
```

### Issue: "Prisma Client not generated"

**Solution**: Run the generate command.

```bash
cd backend
npm run generate
```

### Issue: "Module not found" errors

**Solution**: Clear node_modules and reinstall.

```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: "Port already in use"

**Solution**: Change the port in .env or kill the process using the port.

```bash
# Find process using port 3000 (backend)
lsof -i :3000

# Kill process
kill -9 <PID>

# Or change port in backend/.env
PORT=3001
```

## Development Workflow

### Backend Development

```bash
cd backend

# Start dev server with hot reload
npm run dev

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Type check
npm run type-check

# Lint code
npm run lint

# Open Prisma Studio (database GUI)
npm run db:studio
```

### Frontend Development

```bash
cd frontend

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm test

# Lint code
npm run lint
```

### Database Operations

```bash
cd backend

# Create a new migration
npm run migrate

# Reset database (WARNING: deletes all data)
npm run migrate:reset

# Re-seed database
npm run db:seed

# Open Prisma Studio
npm run db:studio
```

## Project Structure

```
reforma-pro/
├── backend/                    # Express API
│   ├── src/
│   │   ├── config/            # Configuration files
│   │   ├── controllers/       # Route controllers
│   │   ├── middleware/        # Express middleware
│   │   ├── routes/            # API routes
│   │   ├── services/          # Business logic
│   │   ├── utils/             # Utility functions
│   │   └── index.ts           # Entry point
│   ├── prisma/                # Database schema
│   │   ├── schema.prisma      # Prisma schema
│   │   └── seed.ts            # Database seed
│   └── package.json
│
├── frontend/                   # React application
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── pages/             # Page components
│   │   ├── hooks/             # Custom hooks
│   │   ├── lib/               # Utilities
│   │   ├── stores/            # State management
│   │   └── App.tsx            # Root component
│   └── package.json
│
├── docs/                       # Documentation
│   └── ARCHITECTURE.md        # System architecture
│
└── README.md                   # Project overview
```

## Next Steps

1. ✅ Backend and frontend are running
2. 📝 Start building features
3. 🎨 Customize branding and colors
4. 🚀 Deploy to production

## API Documentation

### Authentication Endpoints

- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/auth/me` - Get current user

### Project Endpoints

- `GET /api/v1/projects` - List projects
- `POST /api/v1/projects` - Create project
- `GET /api/v1/projects/:id` - Get project details
- `PATCH /api/v1/projects/:id` - Update project
- `DELETE /api/v1/projects/:id` - Delete project
- `POST /api/v1/projects/:id/generate` - Trigger AI generation

### Image Endpoints

- `POST /api/v1/images/upload/before` - Upload before images
- `POST /api/v1/images/upload/after` - Upload after images
- `DELETE /api/v1/images/:id` - Delete image

### Presentation Endpoints (Public)

- `GET /api/v1/presentations/:token` - View presentation
- `POST /api/v1/presentations/:token/analytics` - Track analytics

### Admin Endpoints

- `GET /api/v1/admin/analytics` - Dashboard analytics
- `GET /api/v1/admin/projects` - All projects
- `GET /api/v1/admin/users` - User management

## Testing the API

### Using cURL

```bash
# Health check
curl http://localhost:3000/health

# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@demo.com","password":"admin123"}'

# Get user (requires token)
curl http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer <your-access-token>"
```

### Using Postman or Insomnia

1. Import the API endpoints
2. Set up environment variables for base URL and tokens
3. Use the Bearer Token authentication type

## Production Deployment

See [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deployment Checklist

- [ ] Update environment variables for production
- [ ] Set strong JWT secrets
- [ ] Configure CORS_ORIGIN to your frontend domain
- [ ] Set up Cloudflare R2 or AWS S3 bucket
- [ ] Configure Claude API key
- [ ] Set NODE_ENV=production
- [ ] Run database migrations on production DB
- [ ] Deploy backend to Railway/Render
- [ ] Deploy frontend to Vercel
- [ ] Configure domain and SSL

## Getting Help

- 📧 Email: support@reformapro.com
- 📚 Documentation: [docs/](./docs/)
- 🐛 Issues: GitHub Issues
- 💬 Discussions: GitHub Discussions

## Development Tips

### Hot Reload

Both backend and frontend have hot reload enabled. Changes will automatically refresh.

### Database Changes

After modifying `prisma/schema.prisma`:

```bash
npm run generate  # Regenerate Prisma Client
npm run migrate   # Create and apply migration
```

### Environment Variables

Changes to `.env` require server restart:

```bash
# Stop server (Ctrl+C)
npm run dev  # Start again
```

### Debugging

- Backend: Use VS Code debugger or `console.log`
- Frontend: Use React DevTools browser extension
- Database: Use Prisma Studio (`npm run db:studio`)

---

**Ready to build! 🚀**
