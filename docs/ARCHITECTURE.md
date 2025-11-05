# REFORMA PRO - SYSTEM ARCHITECTURE

## Executive Summary

Reforma Pro is a professional renovation presentation system designed to replace informal WhatsApp-based client communication with AI-powered, branded presentations. The system enables construction workers to upload before/after photos and informal descriptions, which are then processed by Claude AI to generate professional presentations with unique shareable URLs.

The architecture is built on modern, scalable technologies: React + TypeScript frontend hosted on Vercel, Node.js + Express backend on Railway, PostgreSQL for data persistence, Redis for caching and job queues, and Cloudflare R2 for image storage. The system is designed to handle 50+ concurrent workers, process 100+ projects simultaneously, and scale to 10x growth without major refactoring.

Key architectural principles: stateless API design for horizontal scaling, async job processing for AI operations, aggressive caching for performance, mobile-first responsive design, and security-first approach following OWASP Top 10 best practices.

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │  Worker Mobile   │  │  Client Browser  │  │  Admin Dashboard │  │
│  │   (Upload UI)    │  │  (Presentation)  │  │   (Management)   │  │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘  │
│           │                     │                      │             │
└───────────┼─────────────────────┼──────────────────────┼─────────────┘
            │                     │                      │
            └─────────────────────┼──────────────────────┘
                                  │
                         ┌────────▼────────┐
                         │   Cloudflare    │
                         │   CDN + WAF     │
                         └────────┬────────┘
                                  │
┌─────────────────────────────────┼─────────────────────────────────────┐
│                         API GATEWAY LAYER                              │
├─────────────────────────────────┼─────────────────────────────────────┤
│                                  │                                     │
│                         ┌────────▼────────┐                           │
│                         │  Load Balancer  │                           │
│                         │   (Railway)     │                           │
│                         └────────┬────────┘                           │
│                                  │                                     │
│              ┌───────────────────┼───────────────────┐                │
│              │                   │                   │                │
│     ┌────────▼────────┐ ┌────────▼────────┐ ┌───────▼────────┐      │
│     │  API Server 1   │ │  API Server 2   │ │  API Server N  │      │
│     │  (Express.js)   │ │  (Express.js)   │ │  (Express.js)  │      │
│     └────────┬────────┘ └────────┬────────┘ └───────┬────────┘      │
│              │                   │                   │                │
└──────────────┼───────────────────┼───────────────────┼────────────────┘
               │                   │                   │
┌──────────────┼───────────────────┼───────────────────┼────────────────┐
│              │      APPLICATION LAYER                │                │
├──────────────┼───────────────────┼───────────────────┼────────────────┤
│              │                   │                   │                │
│  ┌───────────▼───────────────────▼───────────────────▼──────────┐   │
│  │                     Service Layer                             │   │
│  ├───────────────────────────────────────────────────────────────┤   │
│  │  Auth Service  │  Project Service  │  Image Service  │  AI    │   │
│  │                │                   │                 │ Service│   │
│  └───────────────────────────────────────────────────────────────┘   │
│                                  │                                    │
│                         ┌────────▼────────┐                          │
│                         │   Job Queues    │                          │
│                         │    (BullMQ)     │                          │
│                         └────────┬────────┘                          │
│                                  │                                    │
│              ┌───────────────────┼───────────────────┐               │
│              │                   │                   │               │
│     ┌────────▼────────┐ ┌────────▼────────┐ ┌───────▼────────┐     │
│     │  Image Worker   │ │   AI Worker     │ │  Email Worker  │     │
│     │    (Sharp.js)   │ │  (Claude API)   │ │                │     │
│     └─────────────────┘ └─────────────────┘ └────────────────┘     │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
                                  │
┌─────────────────────────────────┼─────────────────────────────────────┐
│                          DATA LAYER                                    │
├─────────────────────────────────┼─────────────────────────────────────┤
│                                  │                                     │
│  ┌───────────────────┐  ┌────────▼────────┐  ┌──────────────────┐   │
│  │    PostgreSQL     │  │      Redis      │  │  Cloudflare R2   │   │
│  │   (Primary DB)    │  │  (Cache/Queue)  │  │ (Image Storage)  │   │
│  │                   │  │                 │  │                  │   │
│  │ - users           │  │ - Sessions      │  │ - Original imgs  │   │
│  │ - companies       │  │ - Rate limits   │  │ - Thumbnails     │   │
│  │ - projects        │  │ - Job queue     │  │ - Medium size    │   │
│  │ - images          │  │ - Cache data    │  │ - Full size      │   │
│  │ - analytics       │  │                 │  │                  │   │
│  └───────────────────┘  └─────────────────┘  └──────────────────┘   │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
                                  │
┌─────────────────────────────────┼─────────────────────────────────────┐
│                      EXTERNAL SERVICES                                 │
├─────────────────────────────────┼─────────────────────────────────────┤
│                                  │                                     │
│  ┌───────────────────┐  ┌────────▼────────┐  ┌──────────────────┐   │
│  │   Claude API      │  │     Sentry      │  │   PostMark       │   │
│  │  (Anthropic)      │  │   (Monitoring)  │  │    (Email)       │   │
│  │                   │  │                 │  │                  │   │
│  │ - Haiku (fast)    │  │ - Error track   │  │ - Transactional  │   │
│  │ - Sonnet (quality)│  │ - Performance   │  │ - Notifications  │   │
│  │ - Vision (images) │  │ - Alerts        │  │                  │   │
│  └───────────────────┘  └─────────────────┘  └──────────────────┘   │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend Technologies

#### Core Framework
- **React 18+**: Modern React with concurrent features, Suspense, and automatic batching
- **TypeScript 5+**: Type safety, better IDE support, reduced runtime errors
- **Vite 5+**: Lightning-fast HMR, optimized builds, native ESM support

**Justification**: React provides component reusability and large ecosystem. TypeScript catches errors early and improves maintainability. Vite offers 10x faster dev server than Webpack.

#### UI & Styling
- **Tailwind CSS 3+**: Utility-first CSS, small bundle size, consistent design
- **shadcn/ui**: High-quality accessible components, customizable, no npm install needed
- **Radix UI**: Unstyled accessible primitives for complex components
- **Lucide React**: Modern icon set, tree-shakeable, consistent design

**Justification**: Tailwind reduces custom CSS to near zero. shadcn/ui provides production-ready components. Radix ensures accessibility compliance.

#### State Management
- **Zustand**: Lightweight (1KB), simple API, no boilerplate, TypeScript-first
- **React Query**: Server state management, automatic caching, refetching, optimistic updates

**Justification**: Zustand is simpler than Redux with same power. React Query eliminates manual API state management.

#### Forms & Validation
- **React Hook Form**: Performant forms with minimal re-renders
- **Zod**: TypeScript-first schema validation, type inference

**Justification**: React Hook Form reduces form re-renders by 90%. Zod provides runtime and compile-time type safety.

#### File Upload
- **React Dropzone**: Drag & drop file uploads, mobile-friendly
- **browser-image-compression**: Client-side image compression before upload

**Justification**: Reduces server bandwidth by 70%, faster uploads on slow connections.

#### Routing & Navigation
- **React Router 6+**: Declarative routing, nested routes, data loading

**Justification**: Industry standard, excellent TypeScript support, active maintenance.

### Backend Technologies

#### Core Framework
- **Node.js 20 LTS**: Long-term support, native fetch, improved performance
- **Express.js 4+**: Mature, flexible, large middleware ecosystem
- **TypeScript 5+**: Type-safe backend code

**Justification**: Express is battle-tested and well-documented. Node 20 LTS ensures stability.

#### Database
- **PostgreSQL 15+**: ACID compliance, JSON support, full-text search, mature
- **Prisma ORM**: Type-safe database queries, automatic migrations, excellent DX

**Justification**: PostgreSQL handles complex queries and JSON data. Prisma eliminates SQL injection and provides type safety.

#### Caching & Queues
- **Redis 7+**: In-memory caching, pub/sub, job queues
- **BullMQ**: Robust job queue with Redis, retries, priorities, rate limiting

**Justification**: Redis provides sub-millisecond response times. BullMQ handles async AI processing reliably.

#### Authentication
- **jsonwebtoken**: JWT token generation and verification
- **bcrypt**: Password hashing with salt
- **express-rate-limit**: Rate limiting middleware

**Justification**: JWT enables stateless authentication. bcrypt is industry standard for password hashing.

#### Image Processing
- **Sharp.js**: Fast image resizing, format conversion, optimization
- **image-size**: Quick image dimension extraction

**Justification**: Sharp is 4-10x faster than ImageMagick, supports all required formats.

#### File Upload
- **Multer**: Multipart/form-data handling
- **multer-s3**: Direct S3 upload streaming

**Justification**: Multer is the de-facto Express upload middleware. Streaming prevents memory issues.

#### Storage
- **AWS SDK v3**: Cloudflare R2 / S3 client
- **@aws-sdk/client-s3**: Modular S3 client
- **@aws-sdk/s3-request-presigner**: Signed URL generation

**Justification**: Cloudflare R2 is S3-compatible but 10x cheaper for bandwidth.

#### Validation
- **Zod**: Runtime validation matching frontend schemas
- **express-validator**: Request validation middleware

**Justification**: Shared validation schemas between frontend and backend.

#### Logging & Monitoring
- **Winston**: Structured logging, multiple transports
- **morgan**: HTTP request logging
- **@sentry/node**: Error tracking and performance monitoring

**Justification**: Winston provides production-grade logging. Sentry catches errors in real-time.

#### Testing
- **Jest**: Unit testing framework
- **Supertest**: HTTP assertions
- **ts-jest**: TypeScript support for Jest

**Justification**: Jest is fast and has excellent TypeScript support.

### AI & External Services

#### AI Processing
- **@anthropic-ai/sdk**: Official Claude API client
- **Claude 3.5 Haiku**: Fast, cost-effective for description enhancement ($0.25/MTok)
- **Claude 3.5 Sonnet**: High-quality for complex analysis ($3/MTok)
- **Claude Vision**: Image content analysis

**Justification**: Claude excels at text enhancement and instruction following. Haiku is 5x cheaper than Sonnet for simple tasks.

### Infrastructure & Deployment

#### Hosting
- **Vercel**: Frontend hosting with edge network, automatic previews
- **Railway**: Backend hosting with auto-scaling, built-in PostgreSQL
- **Supabase**: Managed PostgreSQL with realtime subscriptions
- **Upstash Redis**: Serverless Redis with global replication

**Justification**: Vercel provides best-in-class frontend DX. Railway simplifies backend deployment.

#### Storage & CDN
- **Cloudflare R2**: S3-compatible storage, $0 egress fees
- **Cloudflare CDN**: Global CDN integrated with R2

**Justification**: R2 saves 90% on bandwidth costs compared to S3.

#### Monitoring
- **Sentry**: Error tracking, performance monitoring
- **Betterstack**: Uptime monitoring, status pages

**Justification**: Sentry provides comprehensive error context. Betterstack offers simple uptime checks.

#### CI/CD
- **GitHub Actions**: Automated testing and deployment
- **Vercel CLI**: Preview deployments
- **Railway CLI**: Backend deployments

**Justification**: GitHub Actions is free for public repos and integrates with hosting platforms.

## Database Schema

### SQL Schema (PostgreSQL)

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto for encryption
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'worker');
CREATE TYPE project_status AS ENUM ('draft', 'processing', 'completed', 'failed');
CREATE TYPE image_type AS ENUM ('before', 'after');
CREATE TYPE job_status AS ENUM ('queued', 'processing', 'completed', 'failed');
CREATE TYPE event_type AS ENUM ('view', 'share', 'download', 'click');

-- Companies table
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    logo_url TEXT,
    brand_colors JSONB DEFAULT '{"primary": "#6B7F39", "secondary": "#8FA84E", "accent": "#B8C59A"}',
    settings JSONB DEFAULT '{"language": "es", "theme": "light"}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'worker',
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Indexes for users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_company_id ON users(company_id);
CREATE INDEX idx_users_role ON users(role);

-- Projects table
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    created_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(500) NOT NULL,
    description_original TEXT NOT NULL,
    description_enhanced TEXT,
    location VARCHAR(500),
    client_name VARCHAR(255),
    status project_status NOT NULL DEFAULT 'draft',
    presentation_token VARCHAR(100) UNIQUE NOT NULL,
    metadata JSONB DEFAULT '{}',
    view_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for projects
CREATE INDEX idx_projects_company_id ON projects(company_id);
CREATE INDEX idx_projects_created_by ON projects(created_by_user_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_token ON projects(presentation_token);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);

-- Full-text search for projects
CREATE INDEX idx_projects_search ON projects USING gin(
    to_tsvector('spanish', coalesce(title, '') || ' ' || coalesce(description_original, '') || ' ' || coalesce(location, ''))
);

-- Images table
CREATE TABLE images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    type image_type NOT NULL,
    original_url TEXT NOT NULL,
    thumbnail_url TEXT,
    medium_url TEXT,
    full_url TEXT,
    file_name VARCHAR(255) NOT NULL,
    file_size INTEGER NOT NULL,
    width INTEGER,
    height INTEGER,
    format VARCHAR(10),
    order_index INTEGER NOT NULL,
    metadata JSONB DEFAULT '{}',
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for images
CREATE INDEX idx_images_project_id ON images(project_id);
CREATE INDEX idx_images_type ON images(type);
CREATE INDEX idx_images_order ON images(project_id, type, order_index);

-- Processing jobs table
CREATE TABLE processing_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    job_type VARCHAR(50) NOT NULL,
    status job_status NOT NULL DEFAULT 'queued',
    ai_model_used VARCHAR(100),
    processing_time_ms INTEGER,
    tokens_used INTEGER,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for processing jobs
CREATE INDEX idx_jobs_project_id ON processing_jobs(project_id);
CREATE INDEX idx_jobs_status ON processing_jobs(status);
CREATE INDEX idx_jobs_created_at ON processing_jobs(created_at DESC);

-- Analytics events table
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    event_type event_type NOT NULL,
    metadata JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    country_code VARCHAR(2),
    city VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for analytics
CREATE INDEX idx_analytics_project_id ON analytics_events(project_id);
CREATE INDEX idx_analytics_event_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_created_at ON analytics_events(created_at DESC);

-- Refresh tokens table (for JWT rotation)
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    revoked_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for refresh tokens
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);

-- Audit log table (optional, for compliance)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id UUID,
    changes JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for audit logs
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate unique presentation token
CREATE OR REPLACE FUNCTION generate_presentation_token()
RETURNS TEXT AS $$
DECLARE
    token TEXT;
    exists BOOLEAN;
BEGIN
    LOOP
        -- Generate 12-character alphanumeric token
        token := encode(gen_random_bytes(9), 'base64');
        token := REPLACE(token, '/', '');
        token := REPLACE(token, '+', '');
        token := REPLACE(token, '=', '');
        token := SUBSTRING(token FROM 1 FOR 12);

        -- Check if token exists
        SELECT EXISTS(SELECT 1 FROM projects WHERE presentation_token = token) INTO exists;
        EXIT WHEN NOT exists;
    END LOOP;

    RETURN token;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate presentation token
CREATE OR REPLACE FUNCTION set_presentation_token()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.presentation_token IS NULL OR NEW.presentation_token = '' THEN
        NEW.presentation_token := generate_presentation_token();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_project_presentation_token BEFORE INSERT ON projects
    FOR EACH ROW EXECUTE FUNCTION set_presentation_token();

-- View for project statistics
CREATE VIEW project_statistics AS
SELECT
    p.id,
    p.title,
    p.status,
    p.created_at,
    COUNT(DISTINCT i.id) FILTER (WHERE i.type = 'before') as before_image_count,
    COUNT(DISTINCT i.id) FILTER (WHERE i.type = 'after') as after_image_count,
    COUNT(DISTINCT ae.id) FILTER (WHERE ae.event_type = 'view') as view_count,
    COUNT(DISTINCT ae.id) FILTER (WHERE ae.event_type = 'share') as share_count,
    MAX(ae.created_at) as last_viewed_at
FROM projects p
LEFT JOIN images i ON p.id = i.project_id
LEFT JOIN analytics_events ae ON p.id = ae.project_id
GROUP BY p.id;

-- Seed data for development
INSERT INTO companies (name, slug, logo_url, brand_colors) VALUES
    ('Demo Construction', 'demo-construction', NULL, '{"primary": "#6B7F39", "secondary": "#8FA84E", "accent": "#B8C59A"}');

-- Get the company ID for the demo company
DO $$
DECLARE
    demo_company_id UUID;
BEGIN
    SELECT id INTO demo_company_id FROM companies WHERE slug = 'demo-construction';

    -- Create admin user (password: admin123)
    INSERT INTO users (email, password_hash, name, role, company_id) VALUES
        ('admin@demo.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5R/ZJ3hVQGDpO', 'Admin User', 'admin', demo_company_id);

    -- Create worker user (password: worker123)
    INSERT INTO users (email, password_hash, name, role, company_id) VALUES
        ('worker@demo.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5R/ZJ3hVQGDpO', 'Worker User', 'worker', demo_company_id);
END $$;
```

### Entity Relationship Diagram

```
┌─────────────────┐
│    companies    │
│─────────────────│
│ id (PK)         │
│ name            │
│ slug (unique)   │
│ logo_url        │
│ brand_colors    │
│ settings        │
└────────┬────────┘
         │
         │ 1:N
         │
┌────────▼────────┐
│      users      │
│─────────────────│
│ id (PK)         │
│ email (unique)  │
│ password_hash   │
│ name            │
│ role            │
│ company_id (FK) │
└────────┬────────┘
         │
         │ 1:N
         │
┌────────▼────────────────┐
│       projects          │
│─────────────────────────│
│ id (PK)                 │
│ company_id (FK)         │
│ created_by_user_id (FK) │
│ title                   │
│ description_original    │
│ description_enhanced    │
│ status                  │
│ presentation_token      │
│ view_count              │
└──────────┬──────────────┘
           │
           │ 1:N
     ┌─────┴─────┬─────────────────┬──────────────┐
     │           │                 │              │
┌────▼────┐ ┌────▼─────────────┐ ┌▼──────────┐ ┌▼────────────────┐
│ images  │ │ processing_jobs  │ │ analytics │ │ refresh_tokens  │
│─────────│ │──────────────────│ │───────────│ │─────────────────│
│ id (PK) │ │ id (PK)          │ │ id (PK)   │ │ id (PK)         │
│ project │ │ project_id (FK)  │ │ project   │ │ user_id (FK)    │
│ type    │ │ status           │ │ event_type│ │ token           │
│ urls    │ │ ai_model_used    │ │ metadata  │ │ expires_at      │
└─────────┘ └──────────────────┘ └───────────┘ └─────────────────┘
```

## API Specification (OpenAPI 3.0)

```yaml
openapi: 3.0.3
info:
  title: Reforma Pro API
  description: Professional renovation presentation system API
  version: 1.0.0
  contact:
    name: API Support
    email: support@reformapro.com

servers:
  - url: https://api.reformapro.com/api/v1
    description: Production server
  - url: http://localhost:3000/api/v1
    description: Development server

tags:
  - name: Authentication
    description: User authentication and authorization
  - name: Projects
    description: Project management operations
  - name: Images
    description: Image upload and management
  - name: Presentations
    description: Public presentation views
  - name: Admin
    description: Administrative operations

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  schemas:
    Error:
      type: object
      properties:
        error:
          type: string
        message:
          type: string
        code:
          type: string
        details:
          type: object

    User:
      type: object
      properties:
        id:
          type: string
          format: uuid
        email:
          type: string
          format: email
        name:
          type: string
        role:
          type: string
          enum: [admin, worker]
        companyId:
          type: string
          format: uuid
        avatarUrl:
          type: string
          format: uri

    Company:
      type: object
      properties:
        id:
          type: string
          format: uuid
        name:
          type: string
        slug:
          type: string
        logoUrl:
          type: string
          format: uri
        brandColors:
          type: object
          properties:
            primary:
              type: string
            secondary:
              type: string
            accent:
              type: string

    Project:
      type: object
      properties:
        id:
          type: string
          format: uuid
        title:
          type: string
        descriptionOriginal:
          type: string
        descriptionEnhanced:
          type: string
        location:
          type: string
        clientName:
          type: string
        status:
          type: string
          enum: [draft, processing, completed, failed]
        presentationToken:
          type: string
        viewCount:
          type: integer
        beforeImages:
          type: array
          items:
            $ref: '#/components/schemas/Image'
        afterImages:
          type: array
          items:
            $ref: '#/components/schemas/Image'
        createdAt:
          type: string
          format: date-time
        completedAt:
          type: string
          format: date-time

    Image:
      type: object
      properties:
        id:
          type: string
          format: uuid
        type:
          type: string
          enum: [before, after]
        thumbnailUrl:
          type: string
          format: uri
        mediumUrl:
          type: string
          format: uri
        fullUrl:
          type: string
          format: uri
        fileName:
          type: string
        fileSize:
          type: integer
        width:
          type: integer
        height:
          type: integer
        orderIndex:
          type: integer

paths:
  /auth/login:
    post:
      tags: [Authentication]
      summary: User login
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [email, password]
              properties:
                email:
                  type: string
                  format: email
                password:
                  type: string
                  format: password
      responses:
        '200':
          description: Login successful
          content:
            application/json:
              schema:
                type: object
                properties:
                  accessToken:
                    type: string
                  refreshToken:
                    type: string
                  user:
                    $ref: '#/components/schemas/User'
        '401':
          description: Invalid credentials

  /auth/refresh:
    post:
      tags: [Authentication]
      summary: Refresh access token
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [refreshToken]
              properties:
                refreshToken:
                  type: string
      responses:
        '200':
          description: Token refreshed
          content:
            application/json:
              schema:
                type: object
                properties:
                  accessToken:
                    type: string
                  refreshToken:
                    type: string

  /projects:
    get:
      tags: [Projects]
      summary: List projects
      security:
        - bearerAuth: []
      parameters:
        - in: query
          name: page
          schema:
            type: integer
            default: 1
        - in: query
          name: limit
          schema:
            type: integer
            default: 20
        - in: query
          name: status
          schema:
            type: string
            enum: [draft, processing, completed, failed]
      responses:
        '200':
          description: Projects list
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/Project'
                  pagination:
                    type: object
                    properties:
                      page:
                        type: integer
                      limit:
                        type: integer
                      total:
                        type: integer
                      totalPages:
                        type: integer

    post:
      tags: [Projects]
      summary: Create new project
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [title, descriptionOriginal]
              properties:
                title:
                  type: string
                  maxLength: 500
                descriptionOriginal:
                  type: string
                location:
                  type: string
                clientName:
                  type: string
      responses:
        '201':
          description: Project created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Project'

  /projects/{id}:
    get:
      tags: [Projects]
      summary: Get project by ID
      security:
        - bearerAuth: []
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: Project details
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Project'
        '404':
          description: Project not found

    patch:
      tags: [Projects]
      summary: Update project
      security:
        - bearerAuth: []
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: string
            format: uuid
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                title:
                  type: string
                descriptionOriginal:
                  type: string
                location:
                  type: string
                clientName:
                  type: string
      responses:
        '200':
          description: Project updated

    delete:
      tags: [Projects]
      summary: Delete project
      security:
        - bearerAuth: []
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '204':
          description: Project deleted

  /projects/{id}/images/before:
    post:
      tags: [Images]
      summary: Upload before images
      security:
        - bearerAuth: []
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: string
            format: uuid
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              type: object
              properties:
                images:
                  type: array
                  items:
                    type: string
                    format: binary
                  maxItems: 20
      responses:
        '201':
          description: Images uploaded
          content:
            application/json:
              schema:
                type: object
                properties:
                  images:
                    type: array
                    items:
                      $ref: '#/components/schemas/Image'

  /projects/{id}/images/after:
    post:
      tags: [Images]
      summary: Upload after images
      security:
        - bearerAuth: []
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: string
            format: uuid
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              type: object
              properties:
                images:
                  type: array
                  items:
                    type: string
                    format: binary
                  maxItems: 20
      responses:
        '201':
          description: Images uploaded

  /images/{id}:
    delete:
      tags: [Images]
      summary: Delete image
      security:
        - bearerAuth: []
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '204':
          description: Image deleted

  /projects/{id}/generate:
    post:
      tags: [Projects]
      summary: Generate AI-enhanced presentation
      security:
        - bearerAuth: []
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '202':
          description: Generation started
          content:
            application/json:
              schema:
                type: object
                properties:
                  jobId:
                    type: string
                    format: uuid
                  status:
                    type: string

  /projects/{id}/status:
    get:
      tags: [Projects]
      summary: Check processing status
      security:
        - bearerAuth: []
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: Processing status
          content:
            application/json:
              schema:
                type: object
                properties:
                  status:
                    type: string
                  progress:
                    type: integer
                  message:
                    type: string

  /presentations/{token}:
    get:
      tags: [Presentations]
      summary: Get public presentation
      parameters:
        - in: path
          name: token
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Presentation data
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Project'
        '404':
          description: Presentation not found

  /presentations/{token}/analytics:
    post:
      tags: [Presentations]
      summary: Track analytics event
      parameters:
        - in: path
          name: token
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [eventType]
              properties:
                eventType:
                  type: string
                  enum: [view, share, download, click]
                metadata:
                  type: object
      responses:
        '201':
          description: Event tracked

  /admin/analytics:
    get:
      tags: [Admin]
      summary: Get dashboard analytics
      security:
        - bearerAuth: []
      parameters:
        - in: query
          name: startDate
          schema:
            type: string
            format: date
        - in: query
          name: endDate
          schema:
            type: string
            format: date
      responses:
        '200':
          description: Analytics data
          content:
            application/json:
              schema:
                type: object
                properties:
                  totalProjects:
                    type: integer
                  totalViews:
                    type: integer
                  avgProcessingTime:
                    type: number
                  projectsByStatus:
                    type: object
```

## Data Flow Diagrams

### 1. Worker Upload Flow

```
┌────────────┐
│   Worker   │
│  (Mobile)  │
└──────┬─────┘
       │
       │ 1. Login with credentials
       ▼
┌──────────────────┐
│  POST /auth/login│
└──────┬───────────┘
       │
       │ 2. Returns JWT tokens
       ▼
┌──────────────────┐
│  Worker Device   │
│  (Store tokens)  │
└──────┬───────────┘
       │
       │ 3. Create new project
       ▼
┌───────────────────────┐
│ POST /projects        │
│ {                     │
│   title: "Kitchen",   │
│   description: "..."  │
│ }                     │
└──────┬────────────────┘
       │
       │ 4. Returns project_id & token
       ▼
┌──────────────────┐
│  Project Created │
│  ID: abc-123     │
└──────┬───────────┘
       │
       │ 5. Upload before images (parallel)
       ▼
┌─────────────────────────────┐
│ POST /projects/{id}/images/ │
│      before                 │
│ multipart/form-data         │
│ files: [img1, img2, ...]    │
└──────┬──────────────────────┘
       │
       │ 6. Server processes:
       │    - Validate format/size
       │    - Compress with Sharp
       │    - Generate thumbnails
       │    - Upload to R2
       ▼
┌──────────────────┐
│  Image Worker    │
│  (Background)    │
│  ┌────────────┐  │
│  │ Sharp.js   │  │
│  │ - Resize   │  │
│  │ - Optimize │  │
│  │ - Convert  │  │
│  └────────────┘  │
└──────┬───────────┘
       │
       │ 7. Returns image URLs
       ▼
┌──────────────────┐
│  Before Images   │
│  Uploaded (10)   │
└──────┬───────────┘
       │
       │ 8. Upload after images (parallel)
       ▼
┌─────────────────────────────┐
│ POST /projects/{id}/images/ │
│      after                  │
└──────┬──────────────────────┘
       │
       │ 9. Same processing as step 6
       ▼
┌──────────────────┐
│  After Images    │
│  Uploaded (10)   │
└──────┬───────────┘
       │
       │ 10. Trigger AI generation
       ▼
┌─────────────────────────────┐
│ POST /projects/{id}/generate│
└──────┬──────────────────────┘
       │
       │ 11. Queue job in BullMQ
       ▼
┌──────────────────┐
│   Redis Queue    │
│  ┌────────────┐  │
│  │ Job #123   │  │
│  │ Status:    │  │
│  │ queued     │  │
│  └────────────┘  │
└──────┬───────────┘
       │
       │ 12. Worker polls status
       ▼
┌─────────────────────────────┐
│ GET /projects/{id}/status   │
│ Returns: {                  │
│   status: "processing",     │
│   progress: 50              │
│ }                           │
└──────┬──────────────────────┘
       │
       │ 13. Job completes
       ▼
┌──────────────────┐
│  Presentation    │
│  Ready!          │
│  URL: /p/xyz789  │
└──────────────────┘
```

### 2. AI Processing Flow

```
┌──────────────────┐
│   BullMQ Worker  │
│  Picks Job       │
└──────┬───────────┘
       │
       │ 1. Fetch project data
       ▼
┌──────────────────────────┐
│  PostgreSQL              │
│  SELECT * FROM projects  │
│  WHERE id = ?            │
└──────┬───────────────────┘
       │
       │ 2. Get project + images
       ▼
┌──────────────────┐
│  Project Data    │
│  - Title         │
│  - Description   │
│  - 10 before imgs│
│  - 10 after imgs │
└──────┬───────────┘
       │
       │ 3. Download images from R2 (parallel)
       ▼
┌──────────────────┐
│  Cloudflare R2   │
│  Download 20     │
│  thumbnail URLs  │
└──────┬───────────┘
       │
       │ 4. Analyze images with Claude Vision
       ▼
┌────────────────────────────────┐
│  Claude API                    │
│  POST /v1/messages             │
│  {                             │
│    model: "claude-3-5-haiku",  │
│    messages: [{                │
│      role: "user",             │
│      content: [                │
│        {type: "image", ...},   │
│        {type: "text",          │
│         text: "Analyze..."}    │
│      ]                         │
│    }]                          │
│  }                             │
└──────┬─────────────────────────┘
       │
       │ 5. Returns analysis
       ▼
┌──────────────────┐
│  Image Analysis  │
│  - Quality: good │
│  - Type: kitchen │
│  - Changes: new  │
│    cabinets,     │
│    flooring      │
└──────┬───────────┘
       │
       │ 6. Enhance description
       ▼
┌────────────────────────────────┐
│  Claude API                    │
│  POST /v1/messages             │
│  {                             │
│    model: "claude-3-5-haiku",  │
│    messages: [{                │
│      role: "user",             │
│      content: "Transform this  │
│                informal desc:  │
│                '{original}'    │
│                into professional│
│                presentation"   │
│    }],                         │
│    system: [cached prompt]     │
│  }                             │
└──────┬─────────────────────────┘
       │
       │ 7. Returns enhanced text
       ▼
┌──────────────────────────┐
│  Enhanced Description    │
│  "Complete kitchen       │
│   renovation featuring   │
│   custom cabinetry,      │
│   granite countertops,   │
│   and premium hardwood   │
│   flooring..."           │
└──────┬───────────────────┘
       │
       │ 8. Generate image pairings
       ▼
┌──────────────────────────┐
│  AI Pairing Logic        │
│  Match before/after:     │
│  - Spatial similarity    │
│  - Subject matching      │
│  - Best comparisons      │
└──────┬───────────────────┘
       │
       │ 9. Save results to DB
       ▼
┌────────────────────────────────┐
│  PostgreSQL UPDATE             │
│  UPDATE projects SET           │
│    description_enhanced = ?,   │
│    status = 'completed',       │
│    metadata = ?                │
│  WHERE id = ?                  │
└──────┬─────────────────────────┘
       │
       │ 10. Update job status
       ▼
┌──────────────────────────┐
│  Processing Job          │
│  Status: completed       │
│  Processing time: 45s    │
│  Tokens used: 8,542      │
└──────┬───────────────────┘
       │
       │ 11. Send notification (optional)
       ▼
┌──────────────────────────┐
│  Worker receives         │
│  "Presentation ready!"   │
└──────────────────────────┘
```

### 3. Client Presentation View Flow

```
┌──────────────────┐
│     Client       │
│   (Browser)      │
└──────┬───────────┘
       │
       │ 1. Opens shared link
       ▼
┌──────────────────────────┐
│  https://reformapro.com/ │
│  p/xyz789abc             │
└──────┬───────────────────┘
       │
       │ 2. Request presentation
       ▼
┌────────────────────────────────┐
│  GET /presentations/{token}    │
└──────┬─────────────────────────┘
       │
       │ 3. Validate token & fetch data
       ▼
┌──────────────────────────┐
│  PostgreSQL              │
│  SELECT p.*, c.*,        │
│    (SELECT json_agg(i.*) │
│     FROM images i        │
│     WHERE i.project_id=? │
│     AND i.type='before') │
│    as before_images      │
│  FROM projects p         │
│  JOIN companies c        │
│  WHERE token = ?         │
└──────┬───────────────────┘
       │
       │ 4. Returns presentation data
       ▼
┌──────────────────────────┐
│  Presentation JSON       │
│  {                       │
│    id: "...",            │
│    title: "Kitchen...",  │
│    description: "...",   │
│    company: {...},       │
│    beforeImages: [...],  │
│    afterImages: [...]    │
│  }                       │
└──────┬───────────────────┘
       │
       │ 5. Track view event (async)
       ▼
┌───────────────────────────────────┐
│  POST /presentations/{token}/     │
│       analytics                   │
│  {                                │
│    eventType: "view",             │
│    metadata: {                    │
│      referrer: "...",             │
│      userAgent: "..."             │
│    }                              │
│  }                                │
└──────┬────────────────────────────┘
       │
       │ 6. Insert analytics event
       ▼
┌──────────────────────────┐
│  PostgreSQL              │
│  INSERT INTO             │
│    analytics_events      │
│  INCREMENT view_count    │
└──────┬───────────────────┘
       │
       │ 7. Render presentation
       ▼
┌──────────────────────────────────┐
│  React Frontend                  │
│  ┌────────────────────────────┐  │
│  │  Hero Section              │  │
│  │  - Company logo            │  │
│  │  - Project title           │  │
│  └────────────────────────────┘  │
│  ┌────────────────────────────┐  │
│  │  Description               │  │
│  │  (Enhanced by AI)          │  │
│  └────────────────────────────┘  │
│  ┌────────────────────────────┐  │
│  │  Before/After Gallery      │  │
│  │  ┌──────────┬──────────┐   │  │
│  │  │ Before   │ After    │   │  │
│  │  │ <slider> │          │   │  │
│  │  └──────────┴──────────┘   │  │
│  └────────────────────────────┘  │
└──────┬───────────────────────────┘
       │
       │ 8. Load images from CDN
       ▼
┌──────────────────────────┐
│  Cloudflare CDN          │
│  Cache-Control:          │
│    max-age=31536000      │
│  Serve optimized images: │
│  - WebP for modern       │
│  - JPEG for legacy       │
│  - Lazy loading          │
└──────────────────────────┘
```

### 4. Admin Dashboard Flow

```
┌──────────────────┐
│     Admin        │
└──────┬───────────┘
       │
       │ 1. Login
       ▼
┌──────────────────────────┐
│  POST /auth/login        │
│  {                       │
│    email: "admin@...",   │
│    password: "..."       │
│  }                       │
└──────┬───────────────────┘
       │
       │ 2. Verify admin role
       ▼
┌──────────────────────────┐
│  JWT Middleware          │
│  - Verify token          │
│  - Check role === admin  │
└──────┬───────────────────┘
       │
       │ 3. Fetch dashboard data
       ▼
┌──────────────────────────────────┐
│  GET /admin/analytics            │
│  ?startDate=2024-01-01           │
│  &endDate=2024-12-31             │
└──────┬───────────────────────────┘
       │
       │ 4. Aggregate analytics
       ▼
┌────────────────────────────────────┐
│  PostgreSQL Complex Queries       │
│  ┌──────────────────────────────┐ │
│  │ Total Projects by Status     │ │
│  │ SELECT status,               │ │
│  │   COUNT(*) as count          │ │
│  │ FROM projects                │ │
│  │ GROUP BY status              │ │
│  └──────────────────────────────┘ │
│  ┌──────────────────────────────┐ │
│  │ Views Over Time              │ │
│  │ SELECT DATE(created_at),     │ │
│  │   COUNT(*) as views          │ │
│  │ FROM analytics_events        │ │
│  │ WHERE event_type = 'view'    │ │
│  │ GROUP BY DATE(created_at)    │ │
│  └──────────────────────────────┘ │
│  ┌──────────────────────────────┐ │
│  │ Avg Processing Time          │ │
│  │ SELECT AVG(processing_time)  │ │
│  │ FROM processing_jobs         │ │
│  │ WHERE status = 'completed'   │ │
│  └──────────────────────────────┘ │
└────────┬───────────────────────────┘
         │
         │ 5. Returns analytics
         ▼
┌──────────────────────────┐
│  Dashboard Data          │
│  {                       │
│    totalProjects: 145,   │
│    completed: 132,       │
│    processing: 8,        │
│    failed: 5,            │
│    totalViews: 3,842,    │
│    avgTime: 42.5,        │
│    viewsChart: [...]     │
│  }                       │
└──────┬───────────────────┘
       │
       │ 6. Render dashboard
       ▼
┌──────────────────────────────────┐
│  Admin Dashboard UI              │
│  ┌────────────────────────────┐  │
│  │  Stats Cards               │  │
│  │  📊 145    ⏱️ 42.5s         │  │
│  │  Projects  Avg Time        │  │
│  └────────────────────────────┘  │
│  ┌────────────────────────────┐  │
│  │  Projects Table            │  │
│  │  Title      Status  Views  │  │
│  │  Kitchen    ✓       234    │  │
│  │  Bathroom   ⏳      0      │  │
│  └────────────────────────────┘  │
│  ┌────────────────────────────┐  │
│  │  Analytics Chart           │  │
│  │  [Line chart: views/time]  │  │
│  └────────────────────────────┘  │
└──────────────────────────────────┘
```

## Scalability Plan

### Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| API Response Time (p50) | < 100ms | New Relic APM |
| API Response Time (p95) | < 200ms | New Relic APM |
| API Response Time (p99) | < 500ms | New Relic APM |
| Image Upload Time | < 5s per image | Custom metrics |
| AI Processing Time | < 60s per project | Job queue metrics |
| Presentation Load (FCP) | < 2s | Lighthouse |
| Presentation Load (LCP) | < 2.5s | Core Web Vitals |
| Time to Interactive | < 3s | Lighthouse |
| Concurrent Users | 100+ workers | Load testing |
| Concurrent Jobs | 100+ projects | Redis queue |
| Database Connections | 100 pooled | PgBouncer |
| Uptime SLA | 99.9% | Uptime monitoring |

### Horizontal Scaling Strategy

#### Application Layer Scaling

```
Current (MVP):
┌─────────────────┐
│  1 API Server   │  ←  All traffic
│  (2 vCPU, 4GB)  │
└─────────────────┘

Scale to 10x (1000 projects/month):
┌─────────────────┐
│ Load Balancer   │  ←  Railway auto-scaling
│  (Round-robin)  │
└────────┬────────┘
         │
    ┌────┴────┬────────────┬────────────┐
    │         │            │            │
┌───▼───┐ ┌───▼───┐ ┌────▼────┐ ┌────▼────┐
│ API 1 │ │ API 2 │ │  API 3  │ │  API N  │
│ 2vCPU │ │ 2vCPU │ │  2vCPU  │ │  2vCPU  │
└───────┘ └───────┘ └─────────┘ └─────────┘

Scale to 100x (10,000 projects/month):
- Separate services: Auth, Projects, Images, AI
- Kubernetes for orchestration
- Auto-scaling based on CPU/memory
- 10-50 pods per service
```

#### Database Scaling

```
Current (MVP):
┌──────────────────┐
│  PostgreSQL      │
│  (Shared Supabase│
│   2 vCPU, 8GB)   │
└──────────────────┘

Scale to 10x:
┌──────────────────┐
│  PostgreSQL      │  ←  PgBouncer connection pooling
│  (Dedicated)     │     100 connections max
│  4 vCPU, 16GB    │
└──────────────────┘

Scale to 100x:
┌──────────────────┐
│  PostgreSQL      │
│  Primary         │  ←  Write operations
│  (8 vCPU, 32GB)  │
└────────┬─────────┘
         │
    Replication
         │
    ┌────┴────┬─────────────┐
    │         │             │
┌───▼───┐ ┌───▼───┐ ┌─────▼─────┐
│ Read  │ │ Read  │ │   Read    │
│Replica│ │Replica│ │  Replica  │
└───────┘ └───────┘ └───────────┘
                    ↑
              Read operations
              (projects, analytics)
```

#### Caching Strategy

```
┌──────────────────────────────────────┐
│  Cache Layers                        │
├──────────────────────────────────────┤
│                                      │
│  Layer 1: Browser Cache              │
│  - Static assets: 1 year             │
│  - API responses: 5 minutes          │
│  - Service Worker: Offline support   │
│                                      │
│  Layer 2: CDN (Cloudflare)           │
│  - Images: 1 year (immutable)        │
│  - Presentation HTML: 1 hour         │
│  - API responses: 5 minutes          │
│  - Edge caching in 275+ locations    │
│                                      │
│  Layer 3: Redis (Application)        │
│  - Session data: 15 minutes          │
│  - Rate limits: 1 minute             │
│  - Project data: 10 minutes          │
│  - Analytics: 1 hour                 │
│                                      │
│  Layer 4: Database (PostgreSQL)      │
│  - Query cache: Built-in             │
│  - Materialized views: Analytics     │
│  - Indexes: All foreign keys         │
│                                      │
└──────────────────────────────────────┘

Cache Hit Ratios (Target):
- CDN: 95% for images, 80% for HTML
- Redis: 90% for session data
- PostgreSQL: 70% query cache hit
```

#### Queue Scaling

```
Current (MVP):
┌──────────────────┐
│  BullMQ Worker   │  ←  1 worker
│  Processes 1 job │     Sequential
│  at a time       │
└──────────────────┘

Scale to 10x:
┌──────────────────────────────────────┐
│  BullMQ Queue (Redis)                │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ │
│  │Job1│ │Job2│ │Job3│ │...│ │JobN│ │
│  └────┘ └────┘ └────┘ └────┘ └────┘ │
└────┬─────┬─────┬─────┬──────────────┘
     │     │     │     │
   ┌─┴─┐ ┌─┴─┐ ┌─┴─┐ ┌─┴─┐
   │W1 │ │W2 │ │W3 │ │W4 │  ←  4-8 workers
   └───┘ └───┘ └───┘ └───┘     Concurrent

Scale to 100x:
- Separate queues: images, ai, emails
- Priority queues: urgent vs normal
- Rate limiting: 100 req/min to Claude API
- Auto-scaling workers: 1-50 based on queue length
```

### Cost Optimization

#### Current Costs (MVP - 100 projects/month)

```
Vercel (Frontend):
- Hobby plan: $0/month (free tier)

Railway (Backend + DB):
- Starter plan: $5/month
- PostgreSQL: Included
- Bandwidth: 100GB included

Upstash Redis:
- Free tier: $0/month
- 10,000 commands/day

Cloudflare R2:
- Storage: 10GB × $0.015 = $0.15/month
- Operations: Free tier

Claude API:
- Haiku: 100 projects × 5,000 tokens = 500k tokens
- Cost: 500k × $0.25/1M = $0.125/month

Total: ~$5.30/month
```

#### Projected Costs (1,000 projects/month)

```
Vercel (Frontend):
- Pro plan: $20/month

Railway (Backend):
- Pro plan: $20/month
- PostgreSQL: $25/month (dedicated)

Upstash Redis:
- Pay-as-you-go: $10/month

Cloudflare R2:
- Storage: 100GB × $0.015 = $1.50/month
- Operations: 1M writes × $4.50/1M = $4.50/month

Claude API:
- Haiku: 1,000 × 5,000 = 5M tokens
- Cost: 5M × $0.25/1M = $1.25/month

Monitoring (Sentry):
- Team plan: $26/month

Total: ~$108.25/month ($0.11 per project)
```

#### Cost Optimization Strategies

1. **Claude API Prompt Caching**
   - Cache system prompts (5,000 tokens)
   - 90% cache hit rate
   - Reduces costs from $1.25 to $0.20/month

2. **Image Storage Optimization**
   - Aggressive compression (70% size reduction)
   - Lazy loading (reduces bandwidth by 40%)
   - WebP format (30% smaller than JPEG)

3. **Database Query Optimization**
   - Materialized views for analytics
   - Proper indexing (reduces query time by 80%)
   - Connection pooling (reduces connection overhead)

4. **CDN Cache Optimization**
   - 1-year cache for images (immutable)
   - 95% CDN hit rate
   - Reduces R2 bandwidth costs by 95%

### Load Testing Strategy

#### Test Scenarios

```
Scenario 1: Normal Load
- 50 concurrent workers
- 100 project uploads/hour
- 1,000 presentation views/hour
- Duration: 1 hour
Expected: < 200ms p95, 0 errors

Scenario 2: Peak Load
- 200 concurrent workers
- 500 project uploads/hour
- 5,000 presentation views/hour
- Duration: 15 minutes
Expected: < 500ms p95, < 0.1% errors

Scenario 3: Stress Test
- 1,000 concurrent workers
- Ramp up over 10 minutes
- Sustain for 30 minutes
Expected: Find breaking point, graceful degradation

Scenario 4: Spike Test
- 0 to 500 users in 10 seconds
- Sustain for 5 minutes
Expected: Auto-scaling works, < 1% errors
```

#### Load Testing Tools

```yaml
# k6 load testing script
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 50 },   // Ramp up
    { duration: '5m', target: 50 },   // Stay at 50
    { duration: '2m', target: 100 },  // Ramp to 100
    { duration: '5m', target: 100 },  // Stay at 100
    { duration: '2m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<200'],  // 95% under 200ms
    http_req_failed: ['rate<0.01'],    // < 1% errors
  },
};

export default function () {
  // Test presentation view
  const res = http.get('https://api.reformapro.com/presentations/test123');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200,
  });
  sleep(1);
}
```

### Monitoring & Alerting

#### Key Metrics to Monitor

```yaml
Infrastructure:
  - CPU usage: Alert if > 80% for 5 minutes
  - Memory usage: Alert if > 85% for 5 minutes
  - Disk usage: Alert if > 90%
  - Network bandwidth: Track trends

Application:
  - API response time (p50, p95, p99)
  - Error rate: Alert if > 1% for 5 minutes
  - Request rate: Track requests/second
  - Queue length: Alert if > 100 jobs waiting

Database:
  - Connection pool usage: Alert if > 90%
  - Query time (slow queries > 1s)
  - Lock waits: Track contention
  - Replication lag: Alert if > 10 seconds

Business:
  - Projects created/hour
  - AI processing success rate
  - Average processing time
  - Presentation views/day

User Experience:
  - Core Web Vitals (LCP, FID, CLS)
  - Error rate by page
  - API success rate
  - Image load time
```

## Security Measures

### Authentication & Authorization

#### JWT Token Strategy

```typescript
// Token structure
interface AccessToken {
  sub: string;        // User ID
  email: string;      // User email
  role: 'admin' | 'worker';
  companyId: string;  // Company ID
  iat: number;        // Issued at
  exp: number;        // Expires at (15 minutes)
}

interface RefreshToken {
  sub: string;        // User ID
  tokenId: string;    // Token ID (for revocation)
  iat: number;        // Issued at
  exp: number;        // Expires at (7 days)
}

// Token rotation on refresh
// 1. Receive refresh token
// 2. Verify signature and expiry
// 3. Check if revoked in database
// 4. Generate new access + refresh tokens
// 5. Revoke old refresh token
// 6. Return new tokens
```

#### Password Security

```typescript
// Password requirements
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character

// Hashing strategy
import bcrypt from 'bcrypt';

// Hash password (cost factor 12 = 2^12 iterations)
const hash = await bcrypt.hash(password, 12);

// Verify password
const isValid = await bcrypt.compare(password, hash);

// Rate limiting for login attempts
- 5 attempts per IP per 15 minutes
- 10 attempts per email per hour
- Exponential backoff after 3 failures
```

#### Role-Based Access Control (RBAC)

```typescript
// Permission matrix
const permissions = {
  admin: [
    'projects:read:all',
    'projects:write:all',
    'projects:delete:all',
    'users:read:all',
    'users:write:all',
    'analytics:read:all',
    'settings:write',
  ],
  worker: [
    'projects:read:own',
    'projects:write:own',
    'projects:delete:own',
    'images:upload',
  ],
};

// Middleware for authorization
function requirePermission(permission: string) {
  return (req, res, next) => {
    const userPermissions = permissions[req.user.role];
    if (!userPermissions.includes(permission)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}

// Usage
app.delete('/projects/:id',
  authenticate,
  requirePermission('projects:delete:own'),
  deleteProject
);
```

### Data Protection

#### Input Validation

```typescript
// Request validation with Zod
import { z } from 'zod';

const createProjectSchema = z.object({
  title: z.string().min(1).max(500),
  descriptionOriginal: z.string().min(10).max(5000),
  location: z.string().max(500).optional(),
  clientName: z.string().max(255).optional(),
});

// Middleware
function validateRequest(schema: z.ZodSchema) {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      res.status(400).json({
        error: 'Validation failed',
        details: error.errors
      });
    }
  };
}

// File upload validation
const imageSchema = z.object({
  mimetype: z.enum(['image/jpeg', 'image/png', 'image/webp']),
  size: z.number().max(10 * 1024 * 1024), // 10MB max
});
```

#### SQL Injection Prevention

```typescript
// Always use parameterized queries (Prisma prevents SQL injection)
const project = await prisma.project.findUnique({
  where: { id: projectId },  // Parameterized
});

// Never use string concatenation
// ❌ BAD
const query = `SELECT * FROM projects WHERE id = '${projectId}'`;

// ✅ GOOD (Prisma)
const project = await prisma.project.findUnique({
  where: { id: projectId },
});
```

#### XSS Protection

```typescript
// Content Security Policy headers
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https://*.r2.dev; " +
    "font-src 'self' data:; " +
    "connect-src 'self' https://api.reformapro.com;"
  );
  next();
});

// Sanitize user input (frontend)
import DOMPurify from 'dompurify';

const sanitized = DOMPurify.sanitize(userInput);
```

#### CSRF Protection

```typescript
// CSRF tokens for state-changing operations
import csrf from 'csurf';

const csrfProtection = csrf({ cookie: true });

// Apply to routes
app.post('/projects', csrfProtection, createProject);

// Frontend sends CSRF token
fetch('/projects', {
  method: 'POST',
  headers: {
    'CSRF-Token': getCsrfToken(),
  },
  body: JSON.stringify(data),
});
```

### API Security

#### Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';

// General API rate limiting
const apiLimiter = rateLimit({
  store: new RedisStore({ client: redisClient }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests, please try again later',
});

// Stricter limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
});

// Apply limiters
app.use('/api/', apiLimiter);
app.use('/api/auth/login', authLimiter);
```

#### CORS Configuration

```typescript
import cors from 'cors';

const corsOptions = {
  origin: (origin, callback) => {
    const whitelist = [
      'https://reformapro.com',
      'https://app.reformapro.com',
      'http://localhost:5173', // Dev
    ];

    if (!origin || whitelist.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  maxAge: 86400, // 24 hours
};

app.use(cors(corsOptions));
```

#### Signed URLs for Images

```typescript
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { GetObjectCommand } from '@aws-sdk/client-s3';

// Generate signed URL (expires in 1 hour)
async function getImageUrl(key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
  });

  return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
}

// Public presentations get signed URLs on demand
app.get('/presentations/:token', async (req, res) => {
  const project = await getProject(req.params.token);

  // Generate signed URLs for all images
  const images = await Promise.all(
    project.images.map(async (img) => ({
      ...img,
      thumbnailUrl: await getImageUrl(img.thumbnailKey),
      mediumUrl: await getImageUrl(img.mediumKey),
      fullUrl: await getImageUrl(img.fullKey),
    }))
  );

  res.json({ ...project, images });
});
```

### Infrastructure Security

#### HTTPS Enforcement

```typescript
// Redirect HTTP to HTTPS
app.use((req, res, next) => {
  if (req.header('x-forwarded-proto') !== 'https' &&
      process.env.NODE_ENV === 'production') {
    res.redirect(`https://${req.header('host')}${req.url}`);
  } else {
    next();
  }
});

// Strict-Transport-Security header
app.use((req, res, next) => {
  res.setHeader('Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload');
  next();
});
```

#### Security Headers

```typescript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https://*.r2.dev"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  frameguard: { action: 'deny' },
  noSniff: true,
  xssFilter: true,
}));
```

#### Environment Variables

```bash
# .env.example (never commit actual .env)
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL=postgresql://user:pass@host:5432/db
DATABASE_SSL=true
DATABASE_POOL_SIZE=20

# Redis
REDIS_URL=redis://host:6379
REDIS_TLS=true

# JWT
JWT_SECRET=                    # openssl rand -base64 32
JWT_REFRESH_SECRET=            # openssl rand -base64 32
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# AWS/R2
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_BUCKET_NAME=
AWS_REGION=auto
AWS_ENDPOINT=https://<account>.r2.cloudflarestorage.com

# Claude API
CLAUDE_API_KEY=
CLAUDE_MODEL_FAST=claude-3-5-haiku-20241022
CLAUDE_MODEL_QUALITY=claude-3-5-sonnet-20241022

# Monitoring
SENTRY_DSN=
SENTRY_ENVIRONMENT=production

# CORS
CORS_ORIGIN=https://reformapro.com
```

### Compliance & Auditing

#### GDPR Compliance

```typescript
// Data export (user requests their data)
app.get('/api/users/me/export', authenticate, async (req, res) => {
  const userId = req.user.id;

  const data = {
    user: await prisma.user.findUnique({ where: { id: userId } }),
    projects: await prisma.project.findMany({
      where: { createdByUserId: userId }
    }),
    analytics: await prisma.analyticsEvent.findMany({
      where: { userId },
      select: { eventType: true, createdAt: true }, // No IP
    }),
  };

  res.json(data);
});

// Data deletion (user requests deletion)
app.delete('/api/users/me', authenticate, async (req, res) => {
  const userId = req.user.id;

  // Soft delete or anonymize
  await prisma.user.update({
    where: { id: userId },
    data: {
      email: `deleted-${userId}@deleted.com`,
      name: 'Deleted User',
      passwordHash: '',
      isActive: false,
    },
  });

  res.status(204).send();
});
```

#### Audit Logging

```typescript
// Log all important actions
async function logAudit(
  userId: string,
  action: string,
  resourceType: string,
  resourceId: string,
  changes?: object
) {
  await prisma.auditLog.create({
    data: {
      userId,
      action,
      resourceType,
      resourceId,
      changes,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    },
  });
}

// Example usage
app.delete('/projects/:id', authenticate, async (req, res) => {
  const project = await prisma.project.delete({
    where: { id: req.params.id },
  });

  await logAudit(
    req.user.id,
    'delete',
    'project',
    project.id,
    { title: project.title }
  );

  res.status(204).send();
});
```

## Deployment Plan

### Infrastructure as Code

#### Docker Compose (Development)

```yaml
# docker-compose.yml
version: '3.9'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: reforma_pro
      POSTGRES_USER: reforma
      POSTGRES_PASSWORD: reforma_dev_password
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U reforma']
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data
    healthcheck:
      test: ['CMD', 'redis-cli', 'ping']
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - '3000:3000'
    environment:
      NODE_ENV: development
      DATABASE_URL: postgresql://reforma:reforma_dev_password@postgres:5432/reforma_pro
      REDIS_URL: redis://redis:6379
    volumes:
      - ./backend:/app
      - /app/node_modules
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    command: npm run dev

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    ports:
      - '5173:5173'
    environment:
      VITE_API_URL: http://localhost:3000/api/v1
    volumes:
      - ./frontend:/app
      - /app/node_modules
    command: npm run dev

volumes:
  postgres_data:
  redis_data:
```

#### Backend Dockerfile

```dockerfile
# backend/Dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app

COPY package*.json ./
RUN npm ci

# Rebuild source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 reforma

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

USER reforma

EXPOSE 3000

ENV PORT 3000

# Run migrations and start server
CMD npx prisma migrate deploy && node dist/index.js
```

#### Frontend Dockerfile

```dockerfile
# frontend/Dockerfile
FROM node:20-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Build application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build for production
RUN npm run build

# Production image with nginx
FROM nginx:alpine AS runner

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### Nginx Configuration

```nginx
# frontend/nginx.conf
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Enable gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript
               application/x-javascript application/xml+rss
               application/javascript application/json;

    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

### CI/CD Pipeline

#### GitHub Actions (Backend)

```yaml
# .github/workflows/backend.yml
name: Backend CI/CD

on:
  push:
    branches: [main, develop]
    paths:
      - 'backend/**'
  pull_request:
    branches: [main]
    paths:
      - 'backend/**'

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_DB: test_db
          POSTGRES_USER: test_user
          POSTGRES_PASSWORD: test_password
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: backend/package-lock.json

      - name: Install dependencies
        working-directory: backend
        run: npm ci

      - name: Lint code
        working-directory: backend
        run: npm run lint

      - name: Type check
        working-directory: backend
        run: npm run type-check

      - name: Run migrations
        working-directory: backend
        env:
          DATABASE_URL: postgresql://test_user:test_password@localhost:5432/test_db
        run: npx prisma migrate deploy

      - name: Run tests
        working-directory: backend
        env:
          DATABASE_URL: postgresql://test_user:test_password@localhost:5432/test_db
          REDIS_URL: redis://localhost:6379
        run: npm test -- --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: backend/coverage/lcov.info

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Railway
        uses: bervProject/railway-deploy@main
        with:
          railway_token: ${{ secrets.RAILWAY_TOKEN }}
          service: reforma-pro-backend
```

#### GitHub Actions (Frontend)

```yaml
# .github/workflows/frontend.yml
name: Frontend CI/CD

on:
  push:
    branches: [main, develop]
    paths:
      - 'frontend/**'
  pull_request:
    branches: [main]
    paths:
      - 'frontend/**'

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json

      - name: Install dependencies
        working-directory: frontend
        run: npm ci

      - name: Lint code
        working-directory: frontend
        run: npm run lint

      - name: Type check
        working-directory: frontend
        run: npm run type-check

      - name: Run tests
        working-directory: frontend
        run: npm test -- --coverage

      - name: Build
        working-directory: frontend
        env:
          VITE_API_URL: https://api.reformapro.com/api/v1
        run: npm run build

      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v10
        with:
          urls: |
            http://localhost:5173
          uploadArtifacts: true

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
          working-directory: frontend
```

### Deployment Steps

#### 1. Initial Setup (One-time)

```bash
# 1. Create accounts
- Vercel: https://vercel.com (GitHub OAuth)
- Railway: https://railway.app (GitHub OAuth)
- Cloudflare: https://cloudflare.com
- Anthropic: https://console.anthropic.com

# 2. Create Railway project
railway login
railway init reforma-pro-backend
railway add postgres
railway add redis

# 3. Create Cloudflare R2 bucket
- Go to Cloudflare Dashboard > R2
- Create bucket: reforma-pro-images
- Generate API token with R2 permissions

# 4. Set up Vercel project
vercel login
cd frontend
vercel link
vercel env add VITE_API_URL production

# 5. Configure GitHub secrets
- RAILWAY_TOKEN
- VERCEL_TOKEN
- VERCEL_ORG_ID
- VERCEL_PROJECT_ID
```

#### 2. Database Setup

```bash
# Run on Railway (via Railway CLI)
railway run npx prisma migrate deploy
railway run npx prisma db seed
```

#### 3. Environment Variables (Railway)

```bash
# Set via Railway dashboard or CLI
railway variables set NODE_ENV=production
railway variables set JWT_SECRET=$(openssl rand -base64 32)
railway variables set JWT_REFRESH_SECRET=$(openssl rand -base64 32)
railway variables set CLAUDE_API_KEY=sk-ant-...
railway variables set AWS_ACCESS_KEY_ID=...
railway variables set AWS_SECRET_ACCESS_KEY=...
railway variables set AWS_BUCKET_NAME=reforma-pro-images
railway variables set CORS_ORIGIN=https://reformapro.com
```

#### 4. Deploy

```bash
# Backend (automatic via GitHub Actions on push to main)
git push origin main

# Or manual deploy via Railway CLI
cd backend
railway up

# Frontend (automatic via Vercel GitHub integration)
git push origin main

# Or manual deploy via Vercel CLI
cd frontend
vercel --prod
```

### Monitoring Setup

#### Sentry Configuration

```typescript
// backend/src/config/sentry.ts
import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
  integrations: [
    new ProfilingIntegration(),
  ],
});

// frontend/src/config/sentry.ts
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  environment: process.env.VITE_APP_ENV,
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay(),
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

## Open Questions for Stakeholders

### Business Decisions

1. **Pricing Model**
   - Free tier: How many projects per month?
   - Paid tier: Price per additional project?
   - Enterprise tier: Custom pricing for high volume?

2. **Branding**
   - Multiple templates or single branded template?
   - White-label option for large clients?
   - Custom domain support (custom.reformapro.com)?

3. **Features Priority**
   - Video support in Phase 3?
   - Client feedback/approval workflow?
   - Invoice integration?
   - WhatsApp integration for notifications?

4. **Languages**
   - Spanish only or Spanish + English?
   - Additional languages in future?

### Technical Decisions

1. **Image Storage**
   - Cloudflare R2 or AWS S3?
   - Image retention policy (keep forever or delete after X days)?
   - Maximum project storage quota?

2. **AI Configuration**
   - Always use Haiku or allow Sonnet selection?
   - Prompt customization per company?
   - Vision analysis for every image or sample?

3. **Presentation Expiry**
   - Do presentation URLs expire?
   - Archive old projects after X months?
   - Download PDF for permanent records?

4. **Mobile App**
   - Native app or PWA sufficient?
   - iOS + Android or just Android first?
   - Timeline for native apps?

### Compliance & Legal

1. **Data Privacy**
   - GDPR compliance required (EU clients)?
   - Data residency requirements?
   - User consent for analytics tracking?

2. **Content Rights**
   - Who owns the generated descriptions (company or platform)?
   - Copyright for images (company retains rights)?
   - Terms of service for AI-generated content?

3. **Security**
   - SOC 2 compliance required?
   - Penetration testing required?
   - Security audit frequency?

---

## Next Steps

1. **Review & Approve Architecture** (Stakeholder meeting)
2. **Set up Development Environment** (1 day)
3. **Backend MVP Development** (Week 1-2)
   - Database schema & migrations
   - Authentication system
   - Project CRUD APIs
   - Image upload pipeline
4. **Frontend MVP Development** (Week 2-3)
   - Worker upload interface
   - Client presentation view
   - Basic styling with Tailwind
5. **AI Integration** (Week 3)
   - Claude API integration
   - Background job processing
6. **Testing & Deployment** (Week 4)
   - Integration tests
   - Load testing
   - Production deployment
7. **Beta Launch** (End of Week 4)
   - Invite 10 pilot users
   - Gather feedback
   - Iterate on features

---

**Document Version**: 1.0
**Last Updated**: 2024-01-15
**Author**: System Architect
**Status**: Draft - Pending Approval
