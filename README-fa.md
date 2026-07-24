# 🚀 پنل مدیریتی Cloudflare DoH

[![npm version](https://img.shields.io/npm/v/cloudflare-doh-panel.svg)](https://www.npmjs.com/package/cloudflare-doh-panel)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

یک پروکسی و پنل مدیریتی سریع و قدرتمند برای **DNS-over-HTTPS (DoH)** که اختصاصی برای **Cloudflare Workers** توسعه یافته است.

> <img src="./assets/flags/us.svg" width="22" height="22" valign="middle"> **English:** For English documentation, [click here](./README.md).

---

## ✨ ویژگی‌های برجسته

* **⚡ نصب اتوماتیک با یک دستور (CLI):** ساخت خودکار دیتابیس KV، تنظیم فایل `wrangler.toml` و آپلود روی کلودفلر بصورت خودکار.
* **🌐 نصب‌کننده چندزبانه:** پشتیبانی کامل از زبان‌های **فارسی** و **انگلیسی** در ترمینال.
* **📦 ساخت خودکار Workers KV:** ایجاد و اتصال خودکار دیتابیس `CONFIG_KV` جهت ذخیره تنظیمات پنل.
* **🛡️ مدیریت خطای هوشمند:** راهنمایی‌های دقیق و کاربردی در صورت قطع بودن اینترنت، تایم‌اوت یا مشکلات لاگین.
* **🔒 پشتیبانی کامل از DoH:** اجرای پروکسی DNS امن با سرعت بالا و امکان کشینگ.

---

## 🚀 راهنمای سریع (نصب و انتشار)

برای نصب و آپلود این پروژه روی اکانت کلودفلر خود، نیازی به دانلود سورس‌کد ندارید! کافیست ترمینال را باز کرده و دستور زیر را اجرا کنید:

```bash
npx cloudflare-doh-panel

```

### اجرای مستقیم بر اساس زبان:

```bash
# اجرای مستقیم به زبان فارسی
npx cloudflare-doh-panel fa

# اجرای مستقیم به زبان انگلیسی
npx cloudflare-doh-panel en

```

---

## 🛠️ پشت صحنه CLI چه اتفاقی می‌افتد؟

وقتی دستور `npx cloudflare-doh-panel` را می‌زنید:
۱. اتصال شما به حساب کلودفلر از طریق ابزار `wrangler` بررسی می‌شود.
۲. یک دیتابیس KV اختصاصی با نام `CONFIG_KV` به صورت خودکار ساخته می‌شود.
۳. شناسه (ID) دیتابیس استخراج شده و داخل فایل `wrangler.toml` قرار می‌گیرد.
۴. کد ورکر به صورت مستقیم روی اکانت کلودفلر شما آپلود می‌شود.

---

## 💻 نصب دستی (مخصوص توسعه‌دهندگان)

اگر قصد دارید کدهای پروژه را تغییر دهید یا در توسعه آن مشارکت کنید:

```bash
# ۱. کلون کردن مخزن
git clone https://github.com/arshia-ab10/cloudflare-doh-panel.git
cd cloudflare-doh-panel

# ۲. نصب وابستگی‌ها
npm install

# ۳. تست محلی
npm run dev

# ۴. آپلود دستی
npm run deploy

```

---

## 📄 لایسنس

این پروژه یک نرم‌افزار متن‌باز است و تحت [لایسنس MIT](https://www.google.com/search?q=LICENSE) منتشر شده است.
