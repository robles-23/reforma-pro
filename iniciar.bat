@echo off
title Reforma Pro - Iniciador
color 0A
echo.
echo ========================================
echo    REFORMA PRO - ABU24
echo ========================================
echo.

REM Verificar si Node.js está instalado
echo [*] Verificando Node.js...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo.
    echo [ERROR] Node.js no esta instalado
    echo.
    echo Descarga e instala Node.js desde:
    echo https://nodejs.org
    echo.
    pause
    exit /b 1
)

node --version
echo.

REM Verificar Docker (para base de datos)
echo [*] Verificando Docker...
docker --version >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    color 0E
    echo [ADVERTENCIA] Docker no esta instalado o no esta corriendo
    echo La base de datos puede no estar disponible
    echo.
    echo Inicia Docker Desktop si lo tienes instalado
    echo O ejecuta: docker-compose up -d
    echo.
    timeout /t 3 /nobreak >nul
)

REM Limpiar procesos anteriores si existen
echo [*] Limpiando procesos antiguos...
taskkill /F /IM node.exe >nul 2>nul
timeout /t 2 /nobreak >nul

echo.
echo ========================================
echo    Iniciando servicios...
echo ========================================
echo.

REM Iniciar Backend
echo [1/2] Iniciando Backend (Puerto 3000)...
cd /d "%~dp0backend"
if not exist "node_modules" (
    echo [!] Instalando dependencias del backend...
    echo Esto puede tardar unos minutos la primera vez...
    call npm install
)
start "Reforma Pro - Backend [NO CERRAR]" cmd /k "color 0B && echo Backend corriendo en http://localhost:3000 && echo. && npm run dev"

echo     Esperando a que el backend inicie...
timeout /t 8 /nobreak >nul

echo.
echo [2/2] Iniciando Frontend (Puerto 5173)...
cd /d "%~dp0frontend"
if not exist "node_modules" (
    echo [!] Instalando dependencias del frontend...
    echo Esto puede tardar unos minutos la primera vez...
    call npm install
)
start "Reforma Pro - Frontend [NO CERRAR]" cmd /k "color 0B && echo Frontend corriendo en http://localhost:5173 && echo. && npm run dev"

echo     Esperando a que el frontend inicie...
timeout /t 5 /nobreak >nul

color 0A
echo.
echo ========================================
echo    REFORMA PRO INICIADO
echo ========================================
echo.
echo   Backend:  http://localhost:3000
echo   Frontend: http://localhost:5173
echo.
echo   Usuario demo: worker@demo.com
echo   Password:     worker123
echo.
echo ========================================
echo.
echo [*] Abriendo en el navegador...
timeout /t 2 /nobreak >nul

REM Abrir en el navegador predeterminado
start http://localhost:5173

echo.
echo IMPORTANTE:
echo - NO cierres las ventanas "Backend" y "Frontend"
echo - Para detener: ejecuta stop.bat o cierra ambas ventanas
echo.
echo La ventana del navegador se ha abierto automaticamente
echo Si no se abrio, visita: http://localhost:5173
echo.
pause
