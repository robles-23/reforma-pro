@echo off
echo.
echo ==========================================
echo   REFORMA PRO - ABU24
echo ==========================================
echo.

cd /d "%~dp0"

echo [1/4] Verificando Docker...
docker ps >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Docker no esta corriendo
    echo Por favor inicia Docker Desktop y ejecuta este script de nuevo
    pause
    exit /b 1
)
echo OK - Docker esta corriendo
echo.

echo [2/4] Iniciando contenedores Docker...
docker-compose up -d
echo Esperando a que los contenedores esten listos...
ping 127.0.0.1 -n 11 >nul
echo.

echo [3/4] Iniciando Backend (puerto 3000)...
cd backend
start "Backend - NO CERRAR" cmd /k "npm run dev"
cd ..
echo Esperando a que el backend inicie...
ping 127.0.0.1 -n 11 >nul
echo.

echo [4/4] Iniciando Frontend (puerto 5173)...
cd frontend
start "Frontend - NO CERRAR" cmd /k "npm run dev"
cd ..
ping 127.0.0.1 -n 6 >nul

echo.
echo ==========================================
echo   REFORMA PRO INICIADO
echo ==========================================
echo.
echo Se abrieron 2 ventanas:
echo - Backend (puerto 3000)
echo - Frontend (puerto 5173)
echo.
echo Abriendo navegador en 5 segundos...
ping 127.0.0.1 -n 6 >nul

start http://localhost:5173

echo.
echo Usuario: worker@demo.com
echo Password: worker123
echo.
echo Para detener: Cierra las 2 ventanas o ejecuta stop.bat
echo.
pause
