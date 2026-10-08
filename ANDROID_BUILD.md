# مشروع أندرويد الأصيل: حديث ريلز (HadithReels)

هذا المشروع مهيأ ومبني بالكامل كمشروع أندرويد أصيل (Native Android Project) يضم مجلد `android` الكامل مع نظام التجميع **Gradle** و **Capacitor 6** ومكتبات الوصول للذاكرة والمشاركة.

---

## 📌 مسار ملف الـ APK الناتج (Output Location)

عند تجميع المشروع، يتم إنشاء ملف التطبيق القابل للتثبيت المباشر في المسار التالي:

### 1. نسخة التطوير والاختبار السريع (Debug APK):
```
android/app/build/outputs/apk/debug/app-debug.apk
```

### 2. نسخة الإنتاج (Release APK):
```
android/app/build/outputs/apk/release/app-release-unsigned.apk
```

---

## 🚀 الأوامر الدقيقة لبناء ملف الـ APK (Build Commands)

### الطريقة الأولى: سطر الأوامر المباشر عبر Gradle (الأسرع)
من داخل مجلد المشروع الرئيسي:

```bash
# 1. تحديث حزمة الويب ومزامنة أصول أندرويد
npm run build
npx cap sync android

# 2. الانتقال لمجلد أندرويد ومنح صلاحيات التشغيل لـ Gradle
cd android
chmod +x gradlew

# 3. تجميع ملف APK المباشر (Debug)
./gradlew assembleDebug

# أو لتجميع نسخة Release:
./gradlew assembleRelease
```

بعد انتهاء الأمر، ستجد ملف الـ APK جاهزاً في:
`android/app/build/outputs/apk/debug/app-debug.apk`

---

### الطريقة الثانية: عبر Android Studio (واجهة رسومية)
```bash
npx cap open android
```
1. سيفتح المشروع تلقائياً في **Android Studio**.
2. انتظر ثوانٍ لاكتمال مزامنة Gradle Sync.
3. من القائمة العلوية اضغط: **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
4. اضغط على رابط **locate** الذي يظهر في الأسفل لفتح مجلد الـ APK مباشرة.

---

### الطريقة الثالثة: التشغيل المباشر على الهاتف المتصل (USB Debugging)
```bash
npx cap run android
```
يقوم هذا الأمر بتجميع التطبيق وتثبيته وتشغيله فوراً على هاتفك الأندرويد الموصول عبر كابل USB أو المحاكي (Emulator).

---

## 📋 خصائص وإعدادات التطبيق

| الإعداد | القيمة |
| :--- | :--- |
| **اسم المشروع** | `HadithReels` |
| **اسم التطبيق في الهاتف** | `حديث ريلز` |
| **Package Name / Application ID** | `com.hadithreels.app` |
| **الحد الأدنى للنظام (minSdkVersion)** | `24` (Android 7.0 Nougat فما فوق) |
| **النسخة المستهدفة (targetSdkVersion)** | `36` (Android 14 / 15) |
| **دعم اتجاه اليمين لليسار (RTL)** | `android:supportsRtl="true"` مفعل بالكامل |
| **تسريع العتاد (Hardware Acceleration)** | مفعل لمعالجة الفيديو والشاشات فائقة الدقة |
| **الوصول للذاكرة والمعرض** | `READ_MEDIA_VIDEO`, `READ_MEDIA_IMAGES`, `WRITE_EXTERNAL_STORAGE` |

---

## 🌟 الميزات المدمجة في تطبيق الهاتف
1. **جميع الـ 42 حديثاً نبوياً شريفاً** مع التشكيل الكامل والرواة والتخريج والشروحات.
2. **رفع خلفيات مخصصة** من معرض الهاتف مباشرة مع طبقة إسلامية مريحة للقراءة.
3. **توليد فيديوهات ريلز بدقة 1080x1920** بنسب (9:16 و 1:1 و 4:5).
4. **حفظ مباشر في المعرض (Gallery)** ومشاركة فورية عبر واتساب، إنستغرام، وتيك توك.
5. **نطق صوتي آلي عربي** مع تتبع إضاءة الكلمات المنطوقة.
6. **العمل دون اتصال بالإنترنت (100% Offline)** مع حفظ التفضيلات محلياً.
