@echo off
echo ========================================================
echo Building HadithReels Android APK (Debug ^& Release)
echo ========================================================

echo 1. Building web app and syncing Capacitor...
call npm run build
call npx cap sync android

echo 2. Assembling APKs with Gradle...
cd android
call gradlew.bat assembleDebug assembleRelease
cd ..

echo ========================================================
echo APK Build Completed Successfully!
echo ========================================================
echo Output files:
echo Debug:   android\app\build\outputs\apk\debug\app-debug.apk
echo Release: android\app\build\outputs\apk\release\app-release.apk
echo ========================================================
pause
