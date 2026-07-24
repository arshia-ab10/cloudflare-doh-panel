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

*   **Built-in Management Panel:** A beautiful, responsive dashboard (Bootstrap-based) to manage your entire DoH infrastructure.
*   **Custom Endpoints (Routers):** Create multiple custom DoH paths (e.g., `/my-dns/`) and assign specific upstream providers and rules to each.
*   **Advanced DNS Rewriting:** 
    *   Support for `A`, `AAAA`, and `CNAME` records.
    *   **Wildcard Support:** Match exact domains or use wildcards (`*.example.com`).
    *   **CNAME Flattening:** Resolve CNAMEs at the edge and return raw IPs to the client to save round-trips.
*   **Upstream Failover:** Define multiple upstream DoH providers (e.g., Cloudflare, Google). If one fails, the proxy automatically cascades to the next.
*   **EDNS Client Subnet (ECS):** Optionally forward the client's IP to upstream servers for geo-optimized DNS responses.
*   **High Performance:** Utilizes Cloudflare's Cache API and a custom In-Memory Cache to reduce KV reads by 90% and deliver ultra-low latency.
*   **Stealth & Camouflage:** Unauthorized requests or probes to the worker's root are seamlessly proxied to `ubuntu.com`, hiding the true nature of your DoH server.
*   **Live DNS Inspector:** A built-in tool to test DNS resolution and latency directly from the Cloudflare Edge.

### 🚀 Installation

1. Create a new Cloudflare Worker.
2. Create a Cloudflare KV Namespace (e.g., `DOH_CONFIG_KV`).
3. Bind the KV Namespace to your worker with the variable name `CONFIG_KV`.
4. Copy the contents of the project files (`index.js`, `utils.js`, `dnsHandler.js`, `apiHandler.js`, `panel.js`) into your worker (or deploy via Wrangler).
5. Visit your worker's URL. On the **first boot**, the system will generate a secure master password and a secret admin path.
6. Save these credentials! You will be redirected to your secure panel.

### 🔒 Security
The admin panel is protected by a randomly generated **Secret Path** (e.g., `https://your-worker.workers.dev/aB3dE/panel/`) and a hashed master password. You can change these at any time from the dashboard.

---

<h2 id="persian-version" dir="rtl"><img src="https://raw.githubusercontent.com/arshia-ab10/cloudflare-doh-panel/main/assets/flags/ir.svg" width="24" alt="IR Flag"> نسخه فارسی</h2>

<div dir="rtl">

یک **پروکسی DNS over HTTPS (DoH)** قدرتمند، قابل شخصی‌سازی و مخفی که برای Cloudflare Workers طراحی شده است. این پروژه دارای یک داشبورد مدیریت امن و داخلی است که به شما اجازه می‌دهد ترافیک DNS خود را مستقیماً از لبه شبکه (Edge) مسیریابی، بازنویسی و مدیریت کنید.

### ✨ ویژگی‌ها و قابلیت‌ها

*   **پنل مدیریت داخلی:** یک داشبورد زیبا و واکنش‌گرا (بر پایه Bootstrap) برای مدیریت کل زیرساخت DoH شما.
*   **مسیرهای سفارشی (Routers):** ایجاد چندین مسیر DoH دلخواه (مثلاً `/my-dns/`) و اختصاص سرورهای بالادستی و قوانین خاص به هر کدام.
*   **بازنویسی پیشرفته DNS:**
    *   پشتیبانی از رکوردهای `A`، `AAAA` و `CNAME`.
    *   **پشتیبانی از Wildcard:** اعمال قوانین روی دامنه‌های دقیق یا به صورت وایلدکارد (`example.com.*`).
    *   **قابلیت CNAME Flattening:** حل کردن رکوردهای CNAME در سرور و ارسال مستقیم IP به کاربر برای افزایش سرعت.
*   **پشتیبانی از Failover:** تعریف چندین ارائه‌دهنده DoH بالادستی (مثل گوگل، کلودفلر). در صورت قطعی یکی، سیستم به طور خودکار به سرور بعدی سوئیچ می‌کند.
*   **پشتیبانی از ECS (EDNS Client Subnet):** امکان ارسال IP کاربر به سرورهای بالادستی برای دریافت پاسخ‌های DNS بهینه‌شده بر اساس موقعیت جغرافیایی.
*   **عملکرد فوق‌العاده:** استفاده از Cache API کلودفلر و یک In-Memory Cache اختصاصی برای کاهش ۹۰ درصدی درخواست‌ها به دیتابیس KV و ارائه کمترین تاخیر ممکن.
*   **استتار و مخفی‌سازی (Camouflage):** درخواست‌های نامعتبر یا ربات‌هایی که به روت ورکر شما متصل می‌شوند، به صورت خودکار به سایت `ubuntu.com` پروکسی می‌شوند تا ماهیت اصلی سرور شما مخفی بماند.
*   **ابزار تست زنده DNS:** ابزاری داخلی برای تست و بررسی پاسخ‌های DNS و میزان تاخیر مستقیماً از سرورهای کلودفلر.

### 🚀 آموزش نصب

۱. یک Worker جدید در کلودفلر ایجاد کنید.
۲. یک فضای Cloudflare KV (مثلاً با نام `DOH_CONFIG_KV`) بسازید.
۳. این KV را با نام متغیر `CONFIG_KV` به ورکر خود متصل (Bind) کنید.
۴. کدهای پروژه را در ورکر خود قرار دهید (یا از طریق Wrangler دیپلوی کنید).
۵. آدرس ورکر خود را در مرورگر باز کنید. در **اولین اجرا (First Boot)**، سیستم یک رمز عبور قدرتمند و یک مسیر مخفی برای پنل ادمین تولید می‌کند.
۶. این اطلاعات را حتماً ذخیره کنید! پس از آن به پنل امن خود هدایت خواهید شد.

### 🔒 امنیت
پنل مدیریت توسط یک **مسیر مخفی** تصادفی (مثلاً `https://your-worker.workers.dev/aB3dE/panel/`) و یک رمز عبور هش‌شده محافظت می‌شود. شما می‌توانید این اطلاعات را در هر زمان از داخل داشبورد تغییر دهید.

</div>