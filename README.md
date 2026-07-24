# Cloudflare DoH Proxy Panel

<div align="center">
  <a href="#english-version"><img src="https://raw.githubusercontent.com/arshia-ab10/cloudflare-doh-panel/main/assets/flags/us.svg" width="30" alt="English"> <b>English</b></a>
  &nbsp; | &nbsp;
  <a href="#persian-version"><img src="https://raw.githubusercontent.com/arshia-ab10/cloudflare-doh-panel/main/assets/flags/ir.svg" width="30" alt="Persian"> <b>فارسی</b></a>
</div>

---

<h2 id="english-version"><img src="https://raw.githubusercontent.com/arshia-ab10/cloudflare-doh-panel/main/assets/flags/us.svg" width="24" alt="US Flag"> English Version</h2>

A powerful, highly customizable, and stealthy **DNS over HTTPS (DoH) Proxy** built for Cloudflare Workers. It comes with a built-in, secure management dashboard to route, rewrite, and monitor your DNS traffic directly from the edge.

### ✨ Features

* **Built-in Management Panel:** A beautiful, responsive dashboard (Bootstrap-based) to manage your entire DoH infrastructure.
* **Custom Endpoints (Routers):** Create multiple custom DoH paths (e.g., `/my-dns/`) and assign specific upstream providers and rules to each.
* **Advanced DNS Rewriting:** 
  * Support for `A`, `AAAA`, and `CNAME` records.
  * **Wildcard Support:** Match exact domains or use wildcards (`*.example.com`).
  * **CNAME Flattening:** Resolve CNAMEs at the edge and return raw IPs to the client to save round-trips.
* **Upstream Failover:** Define multiple upstream DoH providers (e.g., Cloudflare, Google). If one fails, the proxy automatically cascades to the next.
* **EDNS Client Subnet (ECS):** Optionally forward the client's IP to upstream servers for geo-optimized DNS responses.
* **High Performance:** Utilizes Cloudflare's Cache API and a custom In-Memory Cache to reduce KV reads by 90% and deliver ultra-low latency.
* **Stealth & Camouflage:** Unauthorized requests or probes to the worker's root are seamlessly proxied to `ubuntu.com`, hiding the true nature of your DoH server.
* **Live DNS Inspector:** A built-in tool to test DNS resolution and latency directly from the Cloudflare Edge.

---

### 🚀 Deployment Methods

Choose the method that suits you best:

#### Method 1: One-Click Deploy (Fastest & Easiest)
Deploy directly from your browser in less than a minute. Cloudflare will automatically fork the repository, create the KV database, and deploy the worker.

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/arshia-ab10/cloudflare-doh-panel)

---

#### Method 2: NPM CLI Auto-Installer (Recommended for Terminal Users)
Run a single command in your terminal. The wizard will handle authentication, KV creation, configuration, and deployment automatically.

```bash
# For English UI during setup:
npx cloudflare-doh-panel en

# For Persian UI during setup:
npx cloudflare-doh-panel fa
```

---

#### Method 3: Manual Deployment (For Developers)
If you want full control over the code and deployment process:

1. Clone the repository:
   ```bash
   git clone https://github.com/arshia-ab10/cloudflare-doh-panel.git
   cd cloudflare-doh-panel
   ```

2. Log in to Cloudflare CLI:
   ```bash
   npx wrangler login
   ```

3. Create the KV Namespace:
   ```bash
   npx wrangler kv:namespace create "CONFIG_KV"
   ```

4. Copy the generated KV `id` into `wrangler.toml`:
   ```toml
   [[kv_namespaces]]
   binding = "CONFIG_KV"
   id = "YOUR_GENERATED_KV_ID_HERE"
   ```

5. Deploy to Cloudflare Workers:
   ```bash
   npx wrangler deploy
   ```

---

### 🔒 Security & First Boot

On your **first boot**, visit your worker's root URL. The system will automatically generate:
* A randomized **Secret Path** (e.g., `https://your-worker.workers.dev/aB3dE/panel/`)
* A secure master password.

Save these credentials! You will be required to change them upon your first login.

---

<h2 id="persian-version" dir="rtl"><img src="https://raw.githubusercontent.com/arshia-ab10/cloudflare-doh-panel/main/assets/flags/ir.svg" width="24" alt="IR Flag"> نسخه فارسی</h2>

<div dir="rtl">

یک **پروکسی DNS over HTTPS (DoH)** قدرتمند، قابل شخصی‌سازی و مخفی که برای Cloudflare Workers طراحی شده است. این پروژه دارای یک داشبورد مدیریت امن و داخلی است که به شما اجازه می‌دهد ترافیک DNS خود را مستقیماً از لبه شبکه (Edge) مسیریابی، بازنویسی و مدیریت کنید.

### ✨ ویژگی‌ها و قابلیت‌ها

* **پنل مدیریت داخلی:** یک داشبورد زیبا و واکنش‌گرا (بر پایه Bootstrap) برای مدیریت کل زیرساخت DoH شما.
* **مسیرهای سفارشی (Routers):** ایجاد چندین مسیر DoH دلخواه (مثلاً `/my-dns/`) و اختصاص سرورهای بالادستی و قوانین خاص به هر کدام.
* **بازنویسی پیشرفته DNS:**
  * پشتیبانی از رکوردهای `A`، `AAAA` و `CNAME`.
  * **پشتیبانی از Wildcard:** اعمال قوانین روی دامنه‌های دقیق یا به صورت وایلدکارد (`*.example.com`).
  * **قابلیت CNAME Flattening:** حل کردن رکوردهای CNAME در سرور و ارسال مستقیم IP به کاربر برای افزایش سرعت.
* **پشتیبانی از Failover:** تعریف چندین ارائه‌دهنده DoH بالادستی (مثل گوگل، کلودفلر). در صورت قطعی یکی، سیستم به طور خودکار به سرور بعدی سوئیچ می‌کند.
* **پشتیبانی از ECS (EDNS Client Subnet):** امکان ارسال IP کاربر به سرورهای بالادستی برای دریافت پاسخ‌های DNS بهینه‌شده بر اساس موقعیت جغرافیایی.
* **عملکرد فوق‌العاده:** استفاده از Cache API کلودفلر و یک In-Memory Cache اختصاصی برای کاهش ۹۰ درصدی درخواست‌ها به دیتابیس KV و ارائه کمترین تاخیر ممکن.
* **استتار و مخفی‌سازی (Camouflage):** درخواست‌های نامعتبر یا ربات‌هایی که به روت ورکر شما متصل می‌شوند، به صورت خودکار به سایت `ubuntu.com` پروکسی می‌شوند تا ماهیت اصلی سرور شما مخفی بماند.
* **ابزار تست زنده DNS:** ابزاری داخلی برای تست و بررسی پاسخ‌های DNS و میزان تاخیر مستقیماً از سرورهای کلودفلر.

---

### 🚀 روش‌های نصب و استقرار

روش مورد نظر خود را انتخاب کنید:

#### روش ۱: نصب با یک کلیک (سریع‌ترین و ساده‌ترین)
مستقیماً از مرورگر و بدون نیاز به ترمینال در کمتر از یک دقیقه پروژه را نصب کنید. کلودفلر به صورت خودکار دیتابیس KV را ساخته و پروژه را دیپلوی می‌کند.

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/arshia-ab10/cloudflare-doh-panel)

---

#### روش ۲: نصب خودکار از طریق ترمینال (پیشنهاد شده با NPM)
کافیست یک دستور را در ترمینال اجرا کنید. اسکریپت به صورت خودکار احراز هویت، ساخت KV، تنظیمات و دیپلوی را انجام می‌دهد.

```bash
# نصب با منوی فارسی:
npx cloudflare-doh-panel fa

# نصب با منوی انگلیسی:
npx cloudflare-doh-panel en
```

---

#### روش ۳: نصب دستی (برای توسعه‌دهندگان)
اگر می‌خواهید دسترسی کامل به کدها داشته باشید و مراحل را دستی طی کنید:

۱. کلون کردن پروژه از گیت‌هاب:
   ```bash
   git clone https://github.com/arshia-ab10/cloudflare-doh-panel.git
   cd cloudflare-doh-panel
   ```

۲. ورود به اکانت کلودفلر:
   ```bash
   npx wrangler login
   ```

۳. ساخت دیتابیس KV:
   ```bash
   npx wrangler kv:namespace create "CONFIG_KV"
   ```

۴. قرار دادن `id` ساخته شده در فایل `wrangler.toml`:
   ```toml
   [[kv_namespaces]]
   binding = "CONFIG_KV"
   id = "شناسه_KV_ساخته_شده"
   ```

۵. دیپلوی روی کلودفلر:
   ```bash
   npx wrangler deploy
   ```

---

### 🔒 امنیت و اولین اجرا

در **اولین اجرا**، آدرس اصلی ورکر خود را باز کنید. سیستم به صورت خودکار موارد زیر را تولید می‌کند:
* یک **مسیر مخفی** (مثلاً `https://your-worker.workers.dev/aB3dE/panel/`)
* یک رمز عبور اولیه.

این اطلاعات را ذخیره کنید! در اولین ورود ملزم به تغییر رمز عبور خواهید بود.

</div>
