# دليل بناء وتنزيل ملف APK لتطبيق حديث ريلز 1 (تثبيت مباشر ومستقل)

## 📱 الرابط المباشر لملف الـ APK المستقل (بدون الحاجة لملف ZIP)
تم إعداد سير عمل **GitHub Actions** في `.github/workflows/release.yml` ليبني تلقائياً ملفي `app-debug.apk` و `app-release.apk` بحجم خفيف (~20-25 MB) فور رفع المشروع إلى GitHub، وينشئ روابط تنزيل مباشرة وفورية لهاتفك:

### 🔗 روابط التحميل المباشر بعد رفع المشروع:
- **تحميل ملف التجربة المباشر (Debug APK):**
  ```text
  https://github.com/USERNAME/REPO/releases/latest/download/app-debug.apk
  ```
- **تحميل النسخة الموقعة الجاهزة (Release APK):**
  ```text
  https://github.com/USERNAME/REPO/releases/latest/download/app-release.apk
  ```
*(استبدل `USERNAME` باسم حسابك على GitHub، و `REPO` باسم المستودع)*.

---

## ⚡ كيف يتم البناء والتنزيل التلقائي؟ (3 خطوات فقط)

### الخطوة 1: رفع المشروع إلى GitHub
في طرفية المشروع على جهازك:
```bash
git init
git add .
git commit -m "Configure Android APK build and GitHub Release workflow"
git branch -M main
git remote add origin https://github.com/USERNAME/REPO.git
git push -u origin main
```

### الخطوة 2: يقوم سير عمل GitHub Actions بالبناء تلقائياً:
1. يكتشف سير العمل التغييرات ويبدأ فوراً في خوادم GitHub السحابية.
2. يثبت بيئة Java 17 و Android SDK ويبني ملفات الـ APK الموقعة.
3. ينشر تلقائياً إصدار **GitHub Release** تحت وسم `latest` ويرفق فيه:
   - `app-debug.apk` (جاهز للتثبيت الفوري).
   - `app-release.apk` (موقّع وجاهز للنشر).

### الخطوة 3: التنزيل والتثبيت على الهاتف:
- افتح رابط الـ APK المباشر من متصفح الهاتف:
  `https://github.com/USERNAME/REPO/releases/latest/download/app-debug.apk`
- سيبدأ تنزيل ملف الـ APK فوراً بحجمه الخفيف (~20-25 MB).
- اضغط على الملف بعد اكتمال التنزيل واضغط "تثبيت" (Install) ليعمل التطبيق مباشرة أوفلاين مع كامل الأحاديث والصوتيات.

---

## 💻 البناء المحلي بنقرة واحدة (بدون GitHub)
إذا كان لديك بيئة Java / Android Studio على حاسوبك:
- في أنظمة Linux / macOS: شغل السكربت الجاهز:
  ```bash
  ./build-apk.sh
  ```
- في أنظمة Windows: انقر نقراً مزدوجاً على:
  ```cmd
  build-apk.bat
  ```
وستجد الملفات الناتجة فوراً في:
`android/app/build/outputs/apk/debug/app-debug.apk`
`android/app/build/outputs/apk/release/app-release.apk`
