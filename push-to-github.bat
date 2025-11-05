@echo off
echo ================================================
echo  REFORMA PRO - Push to GitHub
echo ================================================
echo.

echo Verificando Git...
git --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Git no esta instalado
    pause
    exit /b 1
)

echo.
echo IMPORTANTE: Primero crea el repositorio en GitHub:
echo https://github.com/new
echo.
echo Configuracion:
echo - Repository name: reforma-pro
echo - Visibility: Public (recomendado)
echo - NO inicialices con README
echo.
pause

echo.
echo Conectando con GitHub...
git remote add origin https://github.com/robles-23/reforma-pro.git

echo.
echo Renombrando rama a main...
git branch -M main

echo.
echo Subiendo codigo a GitHub...
git push -u origin main

if errorlevel 1 (
    echo.
    echo ERROR al hacer push. Posibles causas:
    echo - El repositorio no existe en GitHub
    echo - Credenciales incorrectas
    echo - Remote 'origin' ya existe
    echo.
    echo Para arreglar remote existente, ejecuta:
    echo   git remote remove origin
    echo   git remote add origin https://github.com/robles-23/reforma-pro.git
    echo.
    pause
    exit /b 1
)

echo.
echo ================================================
echo  EXITO! Codigo subido a GitHub
echo ================================================
echo.
echo Verifica en: https://github.com/robles-23/reforma-pro
echo.
echo Siguiente paso: Lee DEPLOYMENT.md para desplegar en Railway y Vercel
echo.
pause
