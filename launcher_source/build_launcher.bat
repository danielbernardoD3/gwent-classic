@echo off
echo ============================================================
echo   Compilando Gwent Classic Launcher (WebView2)
echo ============================================================

set CSC="C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe"

%CSC% /target:winexe /platform:x64 /win32icon:"..\app.ico" /reference:System.dll,System.Windows.Forms.dll,System.Drawing.dll,"..\Microsoft.Web.WebView2.Core.dll","..\Microsoft.Web.WebView2.WinForms.dll" /out:"..\GwentClassic.exe" "GwentLauncher.cs"

if %ERRORLEVEL% EQU 0 (
    echo [SUCESSO] GwentClassic.exe gerado com sucesso!
) else (
    echo [ERRO] Falha ao compilar.
)

pause
