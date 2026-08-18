<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# اپلیکیشن آشپزی سفره (معماری سازگار با هاست‌های اشتراکی و VPS)

این اپلیکیشن با معماری مقیاس‌پذیر و انعطاف‌پذیر طراحی شده است که با هاست‌های استاندارد (که از MySQL پشتیبانی می‌کنند) کاملاً سازگار بوده و در عین حال قابلیت ارتقا به Redis و Object Storage را دارد.

## معماری سامانه

```
                ┌──────────────┐
                │ React Web    │
                └──────┬───────┘
                       │
                ┌──────▼───────┐
                │ Capacitor    │
                │ iOS / Android│
                └──────┬───────┘
                       │
                ┌──────▼───────┐
                │ API / Auth   │
                └──────┬───────┘
                       │
       ┌───────────────┼───────────────┐
       │                              │                                    │
    MySQL              In-Memory Cache (یا Redis)           Local /uploads (یا S3)
       │                                                                      │
    Users                                                         Food Images
    Recipes
    Fridge
    Plans
    Shopping
```

## راهنمای راه‌اندازی روی هاست (cPanel / VPS)

1. **آپلود فایل‌ها و تنظیم متغیرهای محیطی:**
   فایل `.env.example` را به `.env` تغییر نام دهید و تنظیمات زیر را وارد کنید:
   - `JWT_SECRET`: کلید رمزنگاری توکن امن
   - `MYSQL_URL`: آدرس اتصال به دیتابیس MySQL (مثال: `mysql://user:pass@localhost:3306/db_name`)
   - `REDIS_URL`: (اختیاری - در صورت خالی بودن، از کش داخلی در حافظه استفاده می‌شود)
   - تنظیمات S3: (اختیاری - در صورت خالی بودن، تصاویر در پوشه محلی `uploads/` ذخیره می‌شوند)

2. **نصب وابستگی‌ها و بیلد:**
   ```bash
   npm install
   npm run build
   ```

3. **اجرای سرور:**
   ```bash
   npm start
   ```

## اطلاعات ورود ادمین پیش‌فرض
- **شماره همراه:** `09121111111`
- **ایمیل:** `admin@sofreh.ir`
- **کلمه عبور:** `admin`


