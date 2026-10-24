@echo off
echo Gerekenler: Node.js, JDK 17 ve Android Studio (Android SDK). ANDROID_HOME tanimli olmali.
call npm install || goto :err
if not exist android call npx cap add android || goto :err
call npx cap sync android || goto :err
powershell -Command "(Get-Content android\app\src\main\AndroidManifest.xml) -replace '<activity ','<activity android:screenOrientation=\"portrait\" ' | Set-Content android\app\src\main\AndroidManifest.xml"
cd android
call gradlew.bat assembleDebug || goto :err
echo.
echo BITTI: android\app\build\outputs\apk\debug\app-debug.apk telefona atip kur.
pause & exit /b
:err
echo HATA olustu. Yukaridaki mesaja bak.
pause
