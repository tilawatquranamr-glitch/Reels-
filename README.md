# حديث ريلز 1 (HadithReels) - مشروع أندرويد متكامل

تطبيق إسلامي احترافي جاهز لنظام أندرويد لإنتاج وتصميم بطاقات وفيديوهات ريلز للأحاديث النبوية الشريفة الـ 42 (الأربعون النووية وتتمتها لابن رجب) بصوت القارئ الأستاذ حمد الدريهم (`1.mp3`).

---

## 📱 متطلبات النظام
- **أندرويد 7.0 (Nougat / API 24)** أو أحدث.
- **Java Development Kit (JDK):** إصدار 17 أو 21.
- **Android SDK & Build Tools:** متوافق مع Android 14 و Android 15 (API 34-36).

---

## 🚀 أوامر البناء المباشرة عبر Gradle

ادخل إلى مجلد `android` ونفّذ الأوامر التالية:

### 1. بناء حزمة التطبيق للتجربة والتثبيت المباشر (Debug APK):
```bash
cd android
chmod +x gradlew
./gradlew assembleDebug
```

📍 **موقع ملف الـ APK الناتج:**
```
android/app/build/outputs/apk/debug/app-debug.apk
```

---

### 2. بناء حزمة النشر لمتجر جوجل بلاي (Android App Bundle - AAB):
```bash
cd android
chmod +x gradlew
./gradlew bundleRelease
```

📍 **موقع ملف الـ AAB الناتج:**
```
android/app/build/outputs/bundle/release/app-release.aab
```

---

### 3. بناء نسخة APK نهائية للإنتاج (Release APK):
```bash
cd android
chmod +x gradlew
./gradlew assembleRelease
```

📍 **موقع ملف الـ APK النهائي:**
```
android/app/build/outputs/apk/release/app-release-unsigned.apk
```

---

## 📂 هيكل المشروع (Project Structure)
```
HadithReels_1_Android_Ready/
├── android/                             # مشروع أندرويد الأصلي الكامل (Android Studio Project)
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── AndroidManifest.xml      # إعدادات التطبيق والأذونات ودعم RTL
│   │   │   ├── assets/public/           # ملفات التطبيق والصوتيات مدمجة للعمل دون إنترنت
│   │   │   │   ├── 1.mp3                # التسجيل الصوتي النبوي الأصيل الكامل
│   │   │   │   ├── audio/               # المقاطع الصوتية الموزعة على الـ 42 حديثاً
│   │   │   │   ├── index.html           # واجهة المستخدم المبنية
│   │   │   │   └── assets/              # كود JavaScript وتنسيقات CSS المترجمة
│   │   │   └── res/                     # الأيقونات والقيم والمظهر الإسلامي
│   │   └── build.gradle                 # إعدادات تطبيق أندرويد والمكتبات
│   ├── gradle/wrapper/                  # مشغل Gradle Wrapper الأصلي (v8.14.3)
│   ├── gradlew                          # سكربت تشغيل لينكس/ماك
│   ├── gradlew.bat                      # سكربت تشغيل ويندوز
│   ├── build.gradle                     # إعدادات المشروع الرئيسية
│   └── settings.gradle                  # وحدات المشروع ومكتبات Capacitor
├── capacitor.config.json                # تهيئة Capacitor (com.hadithreels.app)
├── package.json                         # تبعات المشروع ومكتبات أندرويد
├── index.html                           # نقطة دخول الويب
├── src/                                 # كود المصدر البرمجي React + TypeScript
└── README.md                            # دليل البناء والتشغيل
```

---

## 🌟 ميزات المشروع المدمجة
- **دعم كامل للغة العربية والاتجاه من اليمين لليسار (RTL).**
- **تشغيل كامل دون اتصال بالإنترنت (Offline 100%).**
- **تضمين الصوت الرجالي الفصيح (1.mp3) مع الفيديو دون استهلاك الذاكرة.**
- **توافق كامل مع متطلبات متجر Google Play.**
