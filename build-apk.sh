#!/bin/bash
# HadithReels APK Direct Build Script
set -e

echo "========================================================"
echo "🚀 بناء ملف APK لتطبيق حديث ريلز 1 للأندرويد"
echo "========================================================"

# 1. Check Node and npm
echo "📦 1. تجهيز حزم الويب وبناء ملفات التطبيق..."
npm run build
npx cap sync android

# 2. Build APK using Gradle
echo "🤖 2. بناء ملفات app-debug.apk و app-release.apk..."
cd android
chmod +x gradlew
./gradlew assembleDebug assembleRelease

echo ""
echo "========================================================"
echo "✅ تم البناء بنجاح! ملفات الـ APK الجاهزة للتثبيت المباشر:"
echo "========================================================"
echo "📍 Debug APK (للتثبيت الفوري على الهاتف):"
echo "   android/app/build/outputs/apk/debug/app-debug.apk"
echo ""
echo "📍 Release APK (النسخة الموقعة الجاهزة):"
echo "   android/app/build/outputs/apk/release/app-release.apk"
echo "========================================================"
