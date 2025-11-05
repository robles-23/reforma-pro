# Reforma Pro - Información de Producción

## 🌐 URLs Permanentes

### Aplicación Principal
- **Frontend:** https://reforma-pro.vercel.app
- **Backend API:** https://reforma-pro-production.up.railway.app
- **Health Check:** https://reforma-pro-production.up.railway.app/health

### Administración
- **Login:** https://reforma-pro.vercel.app
- **Panel de control:** https://reforma-pro.vercel.app/upload

## 🔐 Credenciales de Acceso

### Usuario Administrador
- **Email:** admin@abu24.com
- **Password:** Abu24Admin2024!
- **Empresa:** Abu24
- **Rol:** ADMIN

⚠️ **IMPORTANTE:** Cambia la contraseña después del primer login.

## 📱 Cómo Funciona

### Crear una Presentación

1. Inicia sesión en https://reforma-pro.vercel.app
2. Sube las imágenes del proyecto:
   - Imágenes "Antes"
   - Imágenes "Después"
   - Albaranes de entrega (opcional)
   - Fichas técnicas (opcional)
3. Rellena la información del proyecto
4. Haz clic en "Generar Presentación"
5. Se generará un link único como:
   ```
   https://reforma-pro.vercel.app/p/clxxx123abc456def789
   ```

### Compartir con Clientes

El link generado:
- ✅ **Es permanente** - Nunca caduca
- ✅ **Es público** - No requiere login
- ✅ **Es único** - Cada proyecto tiene su propio link
- ✅ **Es interactivo** - Incluye slider antes/después
- ✅ **Permite descargas** - PDF de la presentación y fichas técnicas

Puedes compartir el link por:
- WhatsApp
- Email
- SMS
- Cualquier medio digital

### Funcionalidades del Link de Presentación

Los clientes pueden:
1. **Ver el slider antes/después** - Comparar imágenes interactivamente
2. **Ver información del proyecto** - Ubicación, fechas, código de obra
3. **Descargar albaranes** - Si fueron subidos
4. **Descargar fichas técnicas** - De los materiales utilizados
5. **Generar PDF** - Guardar la presentación completa
6. **Compartir el link** - Botón para copiar el link al portapapeles

## 🗄️ Servicios en la Nube

### Vercel (Frontend)
- **Proyecto:** reforma-pro
- **Dominio:** reforma-pro.vercel.app
- **Plan:** Hobby (Gratuito)
- **Dashboard:** https://vercel.com/conversias-projects

### Railway (Backend)
- **Proyecto:** reforma-pro
- **Dominio:** reforma-pro-production.up.railway.app
- **Servicios:**
  - Backend API (Node.js)
  - PostgreSQL (Base de datos)
  - Redis (Caché)
- **Plan:** Pay as you go (~$5-20/mes)
- **Dashboard:** https://railway.app

### Cloudflare R2 (Almacenamiento)
- **Bucket:** abu24
- **CDN URL:** https://pub-32dcf4c5fb0d4641a50765f8f5e9340c.r2.dev
- **Uso:** Almacenamiento de imágenes, PDFs y archivos
- **Costo:** ~$0.015 por GB/mes

### GitHub (Código)
- **Repositorio:** https://github.com/robles-23/reforma-pro
- **Branch principal:** main
- **Auto-deploy:**
  - Push a GitHub → Railway se actualiza automáticamente
  - Push a GitHub → Vercel se actualiza automáticamente

## 💰 Costos Mensuales Estimados

| Servicio | Plan | Costo Estimado |
|----------|------|----------------|
| Vercel | Hobby (Gratuito) | $0 |
| Railway | Pay as you go | $5-20 |
| Cloudflare R2 | Pay as you go | $0-5 |
| **TOTAL** | | **$5-25/mes** |

*Los costos de Railway y R2 dependen del uso (número de visitas, imágenes subidas, etc.)*

## 🔧 Mantenimiento

### Actualizar la Aplicación

1. Realiza cambios en el código local
2. Haz commit: `git add . && git commit -m "Tu mensaje"`
3. Sube a GitHub: `git push`
4. Railway y Vercel se actualizan automáticamente

### Ver Logs de Errores

**Railway:**
- Ve a https://railway.app
- Selecciona el proyecto "reforma-pro"
- Click en el servicio → Pestaña "Deployments" → "Deploy Logs"

**Vercel:**
- Ve a https://vercel.com
- Selecciona el proyecto "reforma-pro"
- Pestaña "Deployments" → Click en el deployment → "Runtime Logs"

### Backup de Base de Datos

Railway hace backups automáticos de PostgreSQL. Para descargar manualmente:

1. Ve a Railway → Postgres → "Backups"
2. Click en "Create Backup"
3. Descarga el archivo .sql

### Crear Nuevos Usuarios

Para crear más usuarios administradores o trabajadores:

```bash
cd reforma-pro/backend
DATABASE_URL="tu-database-url" \\
ADMIN_EMAIL="nuevo@email.com" \\
ADMIN_PASSWORD="Password123!" \\
COMPANY_NAME="Abu24" \\
npm run create-admin
```

*La DATABASE_URL pública está en Railway → Postgres → Connect*

## 📊 Analytics y Monitoreo

Cada presentación registra:
- ✅ Número de vistas
- ✅ Descargas de PDF
- ✅ Compartidos del link
- ✅ Fecha y hora de cada acción

Ver analytics:
1. Login en https://reforma-pro.vercel.app
2. Dashboard (próximamente)

## 🆘 Troubleshooting

### "No puedo iniciar sesión"
- Verifica que uses el email correcto: admin@abu24.com
- La contraseña es case-sensitive: Abu24Admin2024!
- Prueba el health check: https://reforma-pro-production.up.railway.app/health

### "El link de presentación no carga"
1. Verifica que el backend esté corriendo: https://reforma-pro-production.up.railway.app/health
2. Verifica que el token sea correcto (copia el link completo)
3. Revisa los logs en Railway

### "Las imágenes no se muestran"
- Las imágenes están en Cloudflare R2
- Verifica el CDN URL: https://pub-32dcf4c5fb0d4641a50765f8f5e9340c.r2.dev
- Revisa las credenciales de R2 en Railway → Variables

### "El servicio está caído"
1. Ve a Railway → reforma-pro → "Deployments"
2. Revisa el último deployment
3. Si está "Crashed", revisa los logs para ver el error
4. Puedes hacer "Redeploy" manualmente

## 📞 Soporte

- **Repositorio:** https://github.com/robles-23/reforma-pro
- **Issues:** https://github.com/robles-23/reforma-pro/issues

## 🔒 Seguridad

### Variables de Entorno Sensibles

Las siguientes variables están configuradas en Railway y NO deben compartirse públicamente:

- `JWT_SECRET` - Clave para tokens de autenticación
- `JWT_REFRESH_SECRET` - Clave para refresh tokens
- `AWS_ACCESS_KEY_ID` - Credenciales de Cloudflare R2
- `AWS_SECRET_ACCESS_KEY` - Credenciales de Cloudflare R2
- `CLAUDE_API_KEY` - API key de Claude AI
- `DATABASE_URL` - URL de conexión a PostgreSQL
- `REDIS_URL` - URL de conexión a Redis

### Buenas Prácticas

- ✅ Cambia las contraseñas por defecto
- ✅ No compartas las credenciales de Railway/Vercel
- ✅ Revisa los logs regularmente
- ✅ Mantén el código actualizado
- ✅ Haz backups de la base de datos mensualmente

## 📈 Escalabilidad

La aplicación actual puede manejar:
- ✅ Miles de presentaciones
- ✅ Cientos de usuarios simultáneos
- ✅ Gigabytes de imágenes en Cloudflare R2

Si el tráfico crece significativamente:
1. Railway escala automáticamente (pero el costo aumenta)
2. Vercel escala automáticamente (gratis hasta cierto límite)
3. Cloudflare R2 escala ilimitadamente

---

**Última actualización:** 5 de noviembre de 2025
**Versión:** 1.0.0
**Estado:** ✅ Producción funcionando correctamente
