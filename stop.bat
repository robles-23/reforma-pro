@echo off
title Reforma Pro - Detener
color 0C
echo.
echo ========================================
echo    DETENIENDO REFORMA PRO
echo ========================================
echo.

echo [*] Cerrando Backend y Frontend...
taskkill /F /IM node.exe >nul 2>nul

if %ERRORLEVEL% EQU 0 (
    color 0A
    echo.
    echo [OK] Servicios detenidos correctamente
    echo.
    echo Backend y Frontend cerrados
) else (
    color 0E
    echo.
    echo [INFO] No habia procesos activos
    echo Reforma Pro ya estaba detenido
)

echo.
echo ========================================
echo    REFORMA PRO DETENIDO
echo ========================================
echo.
echo Puedes cerrar esta ventana
echo.
pause
