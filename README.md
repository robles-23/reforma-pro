# 🏗️ Reforma Pro - Abu24

> Sistema de gestión y presentación de proyectos de reforma con IA

Plataforma moderna que permite a trabajadores de construcción crear presentaciones profesionales antes/después con solo unos clics. Diseño elegante con logo Abu24 y colores verde oscuro corporativos.

## 🚀 INICIO RÁPIDO - WINDOWS

### ⚡ Método más fácil (Un solo doble clic):

```bash
# 1. Doble clic en:
iniciar.bat

# 2. ¡Eso es todo! El sistema se inicia automáticamente
```

### Archivos de control:

- **`iniciar.bat`** → Inicia todo (Backend + Frontend + Navegador)
- **`stop.bat`** → Detiene todos los servicios
- **`status.bat`** → Verifica el estado del sistema
- **`LEEME.txt`** → Instrucciones rápidas en español

**📖 Guía completa**: [QUICKSTART.md](QUICKSTART.md)

---

## 🖼️ What It Looks Like

### Login Page - Elegant Olive Green Design
Beautiful gradient background with professional branding and demo credentials visible for testing.

### Upload Interface - 4-Step Wizard
**Step 1**: Project information (title, description)
**Step 2**: Upload before photos (drag & drop, up to 20 images)
**Step 3**: Upload after photos (drag & drop, up to 20 images)
**Step 4**: Processing (AI enhances description)

### Presentation View - Interactive Before/After
- **Hero Section**: Project title, location, date
- **Interactive Slider**: Drag to compare before/after images
- **Enhanced Description**: AI-improved, professional text
- **Image Galleries**: Organized before/after photo grids
- **CTA Section**: Call-to-action for new projects

**🎨 See detailed mockups**: [VISUAL_PREVIEW.md](VISUAL_PREVIEW.md)

---

## ✨ Key Features (Phase 1 - MVP)

### For Workers
- 🎨 **Beautiful Olive Green Design** - Professional, nature-inspired color palette
- 📸 **Drag & Drop Upload** - Easy image upload (up to 20 before + 20 after photos)
- 📝 **Informal to Professional** - Write descriptions casually, AI makes them professional
- 📱 **Mobile-First** - Works perfectly on phones in the field
- ⚡ **Fast & Simple** - 4-step wizard from upload to presentation

### Para Clientes
- 🔄 **Comparador Interactivo** - Desliza para comparar antes/después
- 🖼️ **Galerías Elegantes** - Presentación profesional de fotos
- 🔗 **Enlaces Compartibles** - Una URL por proyecto, fácil de compartir
- 🖨️ **Exportación PDF** - Diseño optimizado para impresión sin cortes
- 📊 **Estadísticas** - Contador de visualizaciones, detalles del proyecto
- 🏢 **Branding Abu24** - Logo y colores corporativos verde oscuro

### Technical
- 🤖 **AI-Powered** - Claude API for description enhancement
- 🔒 **Secure** - JWT authentication with refresh tokens
- 🚀 **Scalable** - PostgreSQL + Redis architecture
- 📦 **Production-Ready** - Docker, TypeScript, comprehensive docs

## Tech Stack

### Frontend
- React 18+ with TypeScript
- Vite (build tool)
- Tailwind CSS (styling with custom olive green palette)
- shadcn/ui (component library)
- Zustand (state management)
- React Hook Form + Zod (form validation)
- React Dropzone (file uploads)

### Backend
- Node.js 20+ with Express
- TypeScript
- PostgreSQL 15+ (database)
- Redis (caching & job queues)
- Sharp.js (image processing)
- BullMQ (job queue)
- JWT (authentication)
- Winston (logging)

### AI & Storage
- Claude API (Anthropic) - Description enhancement
- Cloudflare R2 (image storage) - `pub-32dcf4c5fb0d4641a50765f8f5e9340c.r2.dev`
- CDN (image delivery)

### Deployment
- Frontend: Vercel
- Backend: Railway / Render
- Database: Supabase / Neon
- Monitoring: Sentry

## Project Structure

```
reforma-pro/
├── backend/                 # Express API server
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Express middleware
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Utility functions
│   │   ├── jobs/           # Background jobs
│   │   └── index.ts        # Entry point
│   ├── prisma/             # Database schema & migrations
│   ├── tests/              # API tests
│   └── package.json
│
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── ui/        # shadcn/ui components
│   │   │   ├── worker/    # Worker interface components
│   │   │   ├── client/    # Client presentation components
│   │   │   └── admin/     # Admin dashboard components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── stores/        # Zustand stores
│   │   ├── lib/           # Utilities & API client
│   │   ├── types/         # TypeScript types
│   │   └── App.tsx        # Root component
│   ├── public/            # Static assets
│   └── package.json
│
├── docs/                   # Documentation
│   ├── ARCHITECTURE.md    # System architecture
│   ├── API.md             # API documentation
│   ├── DEPLOYMENT.md      # Deployment guide
│   └── SECURITY.md        # Security practices
│
└── infrastructure/         # Infrastructure as code
    ├── docker-compose.yml # Local development
    └── terraform/         # Cloud infrastructure
```

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 15+
- Redis 7+
- npm or pnpm

### Environment Variables

Create `.env` files in both `backend/` and `frontend/`:

**Backend (.env)**
```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/reforma_pro
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
CLAUDE_API_KEY=your-anthropic-api-key
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_BUCKET_NAME=reforma-pro-images
AWS_REGION=us-east-1
CORS_ORIGIN=http://localhost:5173
```

**Frontend (.env)**
```env
VITE_API_URL=http://localhost:3000/api/v1
VITE_APP_NAME=Reforma Pro
```

### Installation & Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd reforma-pro
```

2. **Install backend dependencies**
```bash
cd backend
npm install
```

3. **Set up database**
```bash
npx prisma migrate dev
npx prisma db seed
```

4. **Start backend server**
```bash
npm run dev
```

5. **Install frontend dependencies** (in new terminal)
```bash
cd frontend
npm install
```

6. **Start frontend dev server**
```bash
npm run dev
```

7. **Access the application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- API Docs: http://localhost:3000/api-docs

## Development

### Backend Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run test         # Run tests
npm run lint         # Lint code
npm run migrate      # Run database migrations
```

### Frontend Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run test         # Run tests
npm run lint         # Lint code
```

## API Documentation

Full API documentation available at `/api-docs` when running the backend server.

### Key Endpoints

- `POST /api/v1/auth/login` - User authentication
- `POST /api/v1/projects` - Create new project
- `POST /api/v1/projects/:id/images/before` - Upload before images
- `POST /api/v1/projects/:id/images/after` - Upload after images
- `POST /api/v1/projects/:id/generate` - Generate AI-enhanced presentation
- `GET /api/v1/presentations/:token` - View public presentation

See [docs/API.md](./docs/API.md) for complete documentation.

## Deployment

### Frontend (Vercel)

1. Connect your GitHub repository to Vercel
2. Configure environment variables
3. Deploy automatically on push to main

### Backend (Railway)

1. Create new project on Railway
2. Add PostgreSQL and Redis services
3. Configure environment variables
4. Deploy from GitHub

See [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) for detailed instructions.

## Architecture

The system follows a modern three-tier architecture:

1. **Presentation Layer**: React SPA with responsive design
2. **Application Layer**: Express REST API with business logic
3. **Data Layer**: PostgreSQL database with Redis caching

Key architectural decisions:
- Stateless API for horizontal scaling
- Async job processing for AI operations
- CDN for optimized image delivery
- JWT-based authentication
- Microservices-ready design

See [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) for detailed architecture documentation.

## Security

- HTTPS-only communication
- JWT tokens with refresh token rotation
- Rate limiting (100 req/min per user)
- Signed URLs for image access
- SQL injection prevention
- XSS protection with CSP headers
- OWASP Top 10 compliance

See [docs/SECURITY.md](./docs/SECURITY.md) for security practices.

## Performance Targets

- API response time: < 200ms (p95)
- Image upload: < 5 seconds per image
- AI processing: < 60 seconds per project
- Presentation load: < 2 seconds (First Contentful Paint)
- Support 100 concurrent projects processing

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

Proprietary - All rights reserved

## Support

For issues and questions:
- Email: support@reformapro.com
- Documentation: https://docs.reformapro.com
- Issues: GitHub Issues

## 📊 Project Status

### ✅ Completed (Phase 1 - MVP)
- [x] Complete backend API structure with TypeScript + Express
- [x] PostgreSQL database schema with Prisma ORM
- [x] JWT authentication with refresh tokens
- [x] React frontend with TypeScript + Vite
- [x] Beautiful olive green design system with Tailwind CSS
- [x] Login page with demo credentials
- [x] Multi-step upload interface with drag & drop
- [x] Interactive before/after slider presentation
- [x] Responsive mobile-first layouts
- [x] Comprehensive documentation

### 🔄 In Progress (Needs Implementation)
- [ ] Connect frontend to backend APIs
- [ ] Image upload to S3/Cloudflare R2
- [ ] Claude AI integration for description enhancement
- [ ] Background job processing with BullMQ
- [ ] Analytics tracking on presentations
- [ ] Project CRUD operations

### 📋 Future Phases
**Phase 2**: Admin dashboard, template customization, analytics
**Phase 3**: PWA offline support, PDF export, video support
**Phase 4**: Mobile apps, client feedback, WhatsApp integration

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [QUICKSTART.md](QUICKSTART.md) | Get running in 5 minutes |
| [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) | Complete project overview & TODO list |
| [VISUAL_PREVIEW.md](VISUAL_PREVIEW.md) | Detailed UI mockups & design guide |
| [SETUP_GUIDE.md](SETUP_GUIDE.md) | Step-by-step setup instructions |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Full system architecture & tech decisions |

---

## 🤝 Contributing

**Phase 1 is UI-complete!** To help with implementation:

1. Check the TODO list in [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)
2. Pick a task from "In Progress" section
3. Create a feature branch
4. Implement with tests
5. Submit a pull request

---

## 📝 License

Proprietary - All rights reserved

---

## 🙏 Acknowledgments

- **Color Palette**: Inspired by nature and professional construction
- **Design System**: Built with Tailwind CSS
- **Icons**: Heroicons
- **Demo Images**: Unsplash
- **AI**: Anthropic Claude API

---

## ⭐ What Makes This Special

1. **Interactive Before/After Slider** - Not just side-by-side, drag to compare!
2. **AI-Powered Descriptions** - Workers write informally, AI makes it professional
3. **Mobile-First for Field Work** - Works on phones with slow connections
4. **Beautiful Natural Design** - Olive green palette stands out from competitors
5. **Production-Ready Architecture** - Scalable, secure, well-documented
6. **Complete Documentation** - Architecture, setup, visual guides included

---

Built with ❤️ for construction professionals

**Ready to transform renovation presentations? Get started with [QUICKSTART.md](QUICKSTART.md)**
