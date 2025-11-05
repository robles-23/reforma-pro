# 🚀 Guía de Deployment - Reforma Pro

## 📋 Objetivo

Hacer que las presentaciones de Reforma Pro sean accesibles públicamente desde cualquier dispositivo mediante links compartibles permanentes.

---

## 🎯 Lo que Conseguirás

✅ **Links compartibles**: `https://tu-app.vercel.app/p/TOKEN_UNICO`
✅ **Accesibles globalmente**: Desde cualquier dispositivo y ubicación
✅ **Permanentes**: Los links nunca caducan
✅ **Funcionalidad completa**: Slider interactivo, fichas técnicas descargables, galería

---

## 💰 Costos Estimados

### Opción Recomendada: Railway + Vercel
- **Vercel (Frontend)**: $0/mes (plan Hobby gratuito)
- **Railway (Backend)**: $5/mes gratis al inicio, luego ~$10-20/mes según uso
- **Total**: $0-20/mes

### Alternativa Económica: Render
- **Render (Frontend + Backend)**: $0/mes (con limitación de sleep tras 15 min inactividad)
- **Upstash (Redis)**: $0/mes hasta 10,000 comandos/día
- **Total**: $0/mes (ideal para testing)

---

## 📦 Requisitos Previos

1. **Cuenta de GitHub** (para conectar repositorio)
2. **Cuenta de Railway** → [railway.app](https://railway.app)
3. **Cuenta de Vercel** → [vercel.com](https://vercel.com)
4. **Repositorio Git inicializado** (ya lo tienes)

---

## 🔧 Paso 1: Preparar el Repositorio

### 1.1 Asegúrate de que todos los archivos estén commiteados

```bash
cd reforma-pro
git status
git add .
git commit -m "Preparar para deployment en Railway y Vercel"
```

### 1.2 Sube el repositorio a GitHub (si no lo has hecho)

```bash
# Crear repositorio en GitHub (desde la web de GitHub)
# Luego conectar el repositorio local:

git remote add origin https://github.com/TU_USUARIO/reforma-pro.git
git branch -M main
git push -u origin main
```

---

## 🚂 Paso 2: Deploy del Backend en Railway

### 2.1 Crear Proyecto en Railway

1. Ve a [railway.app](https://railway.app) e inicia sesión
2. Click en **"New Project"**
3. Selecciona **"Deploy from GitHub repo"**
4. Autoriza Railway a acceder a tu GitHub
5. Selecciona el repositorio `reforma-pro`

### 2.2 Configurar el Servicio Backend

1. Railway detectará automáticamente que es un proyecto Node.js
2. **Importante**: Configura el **Root Directory**:
   - Click en el servicio
   - Ve a **Settings** → **Service**
   - En **Root Directory** escribe: `backend`
   - Guarda cambios

### 2.3 Agregar PostgreSQL

1. En tu proyecto de Railway, click en **"+ New"**
2. Selecciona **"Database"** → **"PostgreSQL"**
3. Railway creará automáticamente la base de datos
4. **La variable `DATABASE_URL` se genera automáticamente**

### 2.4 Agregar Redis

1. Click en **"+ New"** otra vez
2. Selecciona **"Database"** → **"Redis"**
3. Railway creará automáticamente Redis
4. **La variable `REDIS_URL` se genera automáticamente**

### 2.5 Configurar Variables de Entorno

1. Click en tu servicio backend
2. Ve a la pestaña **"Variables"**
3. Agrega estas variables (copia los valores de tu `.env` local):

```env
# Las siguientes YA están creadas automáticamente por Railway:
# DATABASE_URL (de PostgreSQL addon)
# REDIS_URL (de Redis addon)

# Debes agregar manualmente:
NODE_ENV=production
PORT=3000
API_VERSION=v1
DATABASE_POOL_SIZE=20
REDIS_TLS=false

# JWT (IMPORTANTE: Cambia estos valores por otros seguros)
JWT_SECRET=genera-un-secreto-muy-largo-y-aleatorio-aqui
JWT_REFRESH_SECRET=genera-otro-secreto-muy-largo-y-aleatorio-aqui
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Cloudflare R2 (IMPORTANTE: Usa tus propias credenciales de Cloudflare R2)
AWS_ACCESS_KEY_ID=tu-cloudflare-r2-access-key-id
AWS_SECRET_ACCESS_KEY=tu-cloudflare-r2-secret-access-key
AWS_BUCKET_NAME=tu-bucket-name
AWS_REGION=auto
AWS_ENDPOINT=https://tu-account-id.r2.cloudflarestorage.com
CDN_URL=https://tu-cdn-url.r2.dev

# Claude AI (IMPORTANTE: Usa tu propia API key de https://console.anthropic.com)
CLAUDE_API_KEY=sk-ant-api03-YOUR-ANTHROPIC-API-KEY-HERE
CLAUDE_MODEL_FAST=claude-3-5-haiku-20241022
CLAUDE_MODEL_QUALITY=claude-3-5-sonnet-20241022
CLAUDE_MAX_TOKENS=4096

# CORS - IMPORTANTE: Lo configuraremos después de tener la URL de Vercel
CORS_ORIGIN=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_MAX=5

# File Upload
MAX_FILE_SIZE=10485760
MAX_FILES_PER_UPLOAD=20
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp

# Image Processing
IMAGE_QUALITY=85
THUMBNAIL_SIZE=200
MEDIUM_SIZE=800
FULL_SIZE=1920

# Logging
LOG_LEVEL=info
LOG_FORMAT=json
```

### 2.6 Obtener la URL del Backend

1. Una vez desplegado, ve a tu servicio backend en Railway
2. Click en **"Settings"** → **"Networking"**
3. Verás algo como: `https://reforma-pro-backend-production-xxxx.up.railway.app`
4. **Copia esta URL** - la necesitarás para Vercel

### 2.7 Ejecutar Migraciones de Prisma

Railway ejecutará automáticamente `npm run build` que incluye `prisma generate`.

**Ejecutar migraciones manualmente** (necesario una vez):

1. En Railway, ve a tu servicio backend
2. Click en **"Deployments"** → última deployment
3. Click en **"View Logs"**
4. Abre una terminal local y ejecuta:

```bash
# Conectar a la base de datos de Railway remotamente
cd backend
npx prisma migrate deploy --schema=./prisma/schema.prisma
```

**O mejor aún, agrega un script de setup:**

Crea un archivo `backend/scripts/railway-setup.sh`:

```bash
#!/bin/bash
npx prisma migrate deploy
npx prisma db seed
```

Y ejecuta desde Railway usando su CLI o configura un "post-deploy" script.

### 2.8 Crear Usuario Demo (Seed)

```bash
cd backend
npx prisma db seed
```

Esto creará el usuario: `worker@demo.com` / `password123`

---

## ▲ Paso 3: Deploy del Frontend en Vercel

### 3.1 Conectar Repositorio a Vercel

1. Ve a [vercel.com](https://vercel.com) e inicia sesión
2. Click en **"Add New"** → **"Project"**
3. Importa tu repositorio de GitHub: `reforma-pro`
4. Vercel detectará automáticamente que es un proyecto Vite

### 3.2 Configurar el Proyecto

En la pantalla de configuración:

1. **Framework Preset**: Vite (auto-detectado) ✓
2. **Root Directory**: Click en **"Edit"** → Escribe: `frontend`
3. **Build Command**: `npm run build` (ya está correcto)
4. **Output Directory**: `dist` (ya está correcto)
5. **Install Command**: `npm install` (ya está correcto)

### 3.3 Configurar Variables de Entorno

En la sección **"Environment Variables"**:

```env
VITE_API_URL=https://TU-URL-DE-RAILWAY.up.railway.app/api/v1
VITE_APP_NAME=Reforma Pro
```

**⚠️ IMPORTANTE**: Reemplaza `TU-URL-DE-RAILWAY` con la URL que copiaste del Paso 2.6

### 3.4 Deploy

1. Click en **"Deploy"**
2. Vercel construirá y desplegará tu frontend (tarda 1-2 minutos)
3. Una vez completado, verás algo como: `https://reforma-pro.vercel.app`
4. **Copia esta URL** - la necesitas para actualizar el CORS del backend

---

## 🔄 Paso 4: Actualizar CORS en Railway

### 4.1 Agregar dominio de Vercel al CORS

1. Vuelve a **Railway**
2. Abre tu servicio **backend**
3. Ve a **"Variables"**
4. Busca la variable `CORS_ORIGIN`
5. Actualízala a:

```env
CORS_ORIGIN=https://reforma-pro.vercel.app,http://localhost:5173
```

**⚠️ IMPORTANTE**: Reemplaza `reforma-pro.vercel.app` con TU dominio de Vercel (sin http://)

6. Guarda los cambios
7. Railway re-desplegará automáticamente el backend (30-60 segundos)

---

## ✅ Paso 5: Verificar el Deployment

### 5.1 Probar el Backend

Abre en tu navegador:

```
https://TU-URL-DE-RAILWAY.up.railway.app/health
```

Deberías ver:

```json
{
  "status": "healthy",
  "timestamp": "2025-10-27T...",
  "services": {
    "database": "connected",
    "redis": "connected"
  }
}
```

### 5.2 Probar el Frontend

1. Abre: `https://reforma-pro.vercel.app` (tu URL de Vercel)
2. Deberías ver la página de login
3. Inicia sesión con: `worker@demo.com` / `password123`

### 5.3 Crear una Presentación de Prueba

1. Inicia sesión
2. Crea un nuevo proyecto:
   - Título: "Prueba de Deployment"
   - Descripción: "Testing presentación pública"
   - Sube 1 imagen antes y 1 después
   - (Opcional) Sube albarán y fichas técnicas
3. Click en **"Generar Presentación"**
4. Espera a que la IA procese (30-60 segundos)

### 5.4 Probar Link Compartible

1. Una vez generada la presentación, verás la URL:
   `https://reforma-pro.vercel.app/p/clkvh3...`

2. **Copia el link** (botón "Compartir Link")

3. **Prueba en otro dispositivo o navegador privado**:
   - Abre el link en tu móvil
   - Abre en modo incógnito
   - Comparte con alguien más

4. **Verifica funcionalidades**:
   - ✅ Slider antes/después funciona
   - ✅ Imágenes cargan desde Cloudflare CDN
   - ✅ Fichas técnicas se pueden descargar
   - ✅ Botón "Descargar PDF" funciona
   - ✅ Botón "Compartir Link" copia la URL

---

## 🐛 Troubleshooting

### Problema: Backend no se conecta a la base de datos

**Solución**:
1. Verifica que el addon de PostgreSQL esté vinculado al servicio backend
2. Verifica que `DATABASE_URL` exista en las variables
3. Revisa los logs de Railway para ver el error específico

### Problema: Frontend muestra "Network Error"

**Solución**:
1. Verifica que `VITE_API_URL` esté correctamente configurada en Vercel
2. Verifica que el backend esté desplegado y funcionando (health check)
3. Verifica que `CORS_ORIGIN` incluya el dominio de Vercel

### Problema: Prisma migrations no se ejecutan

**Solución**:
1. Conecta manualmente a la base de datos:
   ```bash
   # Copia la DATABASE_URL de Railway
   cd backend
   DATABASE_URL="postgresql://..." npx prisma migrate deploy
   ```

### Problema: "Cannot find module 'some-module'"

**Solución**:
1. Asegúrate de que el módulo esté en `dependencies` (no en `devDependencies`)
2. En Railway, intenta un "Redeploy" desde cero

---

## 📊 Monitoreo

### Railway Dashboard

- **Logs**: Ve a "Deployments" → "View Logs" para ver logs en tiempo real
- **Metrics**: Ve a "Metrics" para ver uso de CPU, memoria y red
- **Costs**: Ve a "Usage" para ver costos estimados

### Vercel Dashboard

- **Analytics**: Ve a tu proyecto → "Analytics" para ver visitas
- **Deployments**: Historial completo de deployments
- **Logs**: Logs de funciones serverless

---

## 🎉 ¡Listo!

Ahora tu aplicación Reforma Pro está desplegada y accesible globalmente:

- **Frontend**: `https://reforma-pro.vercel.app`
- **Backend**: `https://reforma-pro-backend-production.up.railway.app`
- **Presentaciones**: `https://reforma-pro.vercel.app/p/TOKEN`

Los links de presentación son:
✅ Públicos (no requieren login)
✅ Permanentes (nunca expiran)
✅ Compartibles (copiar y enviar por WhatsApp, Email, etc.)
✅ Interactivos (slider, fichas técnicas, galerías)

---

## 🔄 Futuros Deploys

### Actualizar Backend

```bash
git add .
git commit -m "Actualización backend"
git push origin main
```

Railway detectará el cambio y re-desplegará automáticamente.

### Actualizar Frontend

```bash
git add .
git commit -m "Actualización frontend"
git push origin main
```

Vercel detectará el cambio y re-desplegará automáticamente.

---

## 📱 Compartir Presentaciones con Clientes

### Flujo de Uso

1. **Trabajador crea proyecto** en `https://reforma-pro.vercel.app`
2. **Sube fotos, albaranes, fichas técnicas**
3. **Genera presentación** (IA procesa en 30-60s)
4. **Click en "Compartir Link"** → Copia URL
5. **Envía por WhatsApp/Email** al cliente
6. **Cliente abre link** → Ve presentación interactiva
7. **(Opcional)** Cliente descarga PDF estático

---

## 💡 Tips Avanzados

### Dominios Personalizados

**Vercel (Frontend)**:
1. Ve a tu proyecto → "Settings" → "Domains"
2. Agrega tu dominio: `presentaciones.tuempresa.com`
3. Configura DNS según instrucciones de Vercel

**Railway (Backend)**:
1. Ve a Settings → Networking → Custom Domain
2. Agrega tu dominio: `api.tuempresa.com`
3. Configura DNS según instrucciones

### Staging Environment

Crea una rama `staging` en Git:

```bash
git checkout -b staging
git push origin staging
```

Luego crea servicios separados en Railway/Vercel para staging.

---

## 📞 Soporte

Si tienes problemas:

1. **Railway**: [railway.app/help](https://railway.app/help)
2. **Vercel**: [vercel.com/support](https://vercel.com/support)
3. **Documentación Prisma**: [prisma.io/docs](https://prisma.io/docs)

---

✨ **¡Disfruta de tu aplicación desplegada!** ✨
