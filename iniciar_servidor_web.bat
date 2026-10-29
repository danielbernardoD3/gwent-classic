@echo off
title Gwent Classic - Servidor Web Local
cd /d "%~dp0"
echo ========================================================
echo        GWENT CLASSIC - SERVIDOR LOCAL INICIADO
echo ========================================================
echo.
echo No computador, acesse no navegador:
echo   http://localhost:8080
echo.
echo No celular (conectado no mesmo Wi-Fi), acesse:
echo   http://192.168.100.44:8080
echo.
echo Pressione Ctrl+C nesta janela para encerrar o servidor.
echo ========================================================
echo.
python -m http.server 8080
pause
