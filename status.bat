@echo off
title Reforma Pro - Estado
color 0B
echo.
echo ========================================
echo    REFORMA PRO - ESTADO
echo ========================================
echo.

echo [*] Verificando servicios...
echo.

REM Verificar Backend (puerto 3000)
netstat -ano | findstr ":3000" | findstr "LISTENING" >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Backend:  CORRIENDO en puerto 3000
    set BACKEND_STATUS=OK
) else (
    echo [X]  Backend:  NO ESTA CORRIENDO
    set BACKEND_STATUS=ERROR
)

REM Verificar Frontend (puerto 5173)
netstat -ano | findstr ":5173" | findstr "LISTENING" >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Frontend: CORRIENDO en puerto 5173
    set FRONTEND_STATUS=OK
) else (
    echo [X]  Frontend: NO ESTA CORRIENDO
    set FRONTEND_STATUS=ERROR
)

echo.

REM Verificar Docker
docker ps >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Docker:   CORRIENDO
    docker ps --format "table {{.Names}}\t{{.Status}}" | findstr "reforma"
) else (
    echo [X]  Docker:   NO ESTA CORRIENDO
)

echo.
echo ========================================

if "%BACKEND_STATUS%"=="OK" if "%FRONTEND_STATUS%"=="OK" (
    color 0A
    echo    ESTADO: TODO OK
    echo ========================================
    echo.
    echo La aplicacion esta lista para usar
    echo Abre: http://localhost:5173
) else (
    color 0E
    echo    ESTADO: SERVICIOS DETENIDOS
    echo ========================================
    echo.
    echo Para iniciar la aplicacion:
    echo Ejecuta: start.bat
)

echo.
pause
