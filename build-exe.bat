@echo off
echo [1/2] Paketler yukleniyor...
call npm install || goto :err
echo [2/2] Windows EXE olusturuluyor...
call npm run dist:win || goto :err
echo.
echo BITTI: dist klasorundeki GeceKosusu .exe dosyasini calistir.
pause & exit /b
:err
echo HATA olustu. Node.js (https://nodejs.org) kurulu mu?
pause
