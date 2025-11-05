@echo off
echo.
echo ==========================================
echo   REFORMA PRO - ABU24
echo ==========================================
echo.
echo Iniciando servicios...
echo.

cd /d "%~dp0"

echo [1/2] Iniciando Backend...
cd backend
start "Backend - NO CERRAR" cmd /k "npm run dev"
cd ..

echo [2/2] Iniciando Frontend...
cd frontend
start "Frontend - NO CERRAR" cmd /k "npm run dev"
cd ..

echo.
echo ==========================================
echo   SERVICIOS INICIADOS
echo ==========================================
echo.
echo Se abrieron 2 ventanas:
echo - Backend (puerto 3000)
echo - Frontend (puerto 5173)
echo.
echo Espera 30 segundos y abre:
echo http://localhost:5173
echo.
echo Usuario: worker@demo.com
echo Password: worker123
echo.
pause
