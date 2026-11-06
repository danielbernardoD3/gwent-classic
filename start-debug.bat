@echo off
title Gwent Classic - Servidor de Desenvolvimento
echo ============================================================
echo   Iniciando Gwent Classic em Modo de Desenvolvimento
echo ============================================================
cd /d "%~dp0"
node scripts\dev-server.js
pause

