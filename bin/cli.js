#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// متن‌های پشتیبانی‌شده در برنامه (English & Persian)
const i18n = {
  fa: {
    welcome: "🚀 به نصب‌کننده خودکار Cloudflare DoH Panel خوش آمدید!",
    checkingLogin: "🔐 در حال بررسی اتصال به حساب Cloudflare...",
    creatingKV: "📦 در حال ساخت دیتابیس KV با نام CONFIG_KV...",
    kvSuccess: (id) => `✅ دیتابیس با شناسه ${id} با موفقیت ساخته شد.`,
    updatingConfig: "⚙️ در حال تنظیم فایل wrangler.toml...",
    deploying: "📤 در حال آپلود پروژه روی Cloudflare Workers...",
    success: "🎉 تبریک! نصب با موفقیت انجام شد. پنل DoH شما آماده است.",
    selectLang: "Please select language / لطفاً زبان را انتخاب کنید:\n1) English\n2) فارسی\nChoice (1-2) [default: 1]: ",
    // بخش خطاهای حرفه‌ای
    errorTitle: "❌ اوه! در اجرای مراحل مشکلی پیش آمد.",
    errorTips: `💡 راهنمای حل مشکل:
  ۱. وضعیت اینترنت یا VPN خود را بررسی کنید (تحریم‌شکن‌ها گاهی روی کلودفلر اختلال ایجاد می‌کنند).
  ۲. مطمئن شوید در مرورگر باز شده، به اکانت کلودفلر خود با موفقیت لاگین کرده‌اید.
  ۳. اگر ارور مربوط به نام تکراری دیتابیس است، مشکلی نیست.
  
  🔄 لطفاً دستور را دوباره اجرا کنید.`
  },
  en: {
    welcome: "🚀 Welcome to Cloudflare DoH Panel Auto-Installer!",
    checkingLogin: "🔐 Checking Cloudflare authentication...",
    creatingKV: "📦 Creating KV Namespace 'CONFIG_KV'...",
    kvSuccess: (id) => `✅ KV Namespace created successfully (ID: ${id})`,
    updatingConfig: "⚙️ Updating wrangler.toml configuration...",
    deploying: "📤 Deploying to Cloudflare Workers...",
    success: "🎉 Congratulations! Deployment completed successfully. Your DoH Panel is live.",
    selectLang: "Please select language / لطفاً زبان را انتخاب کنید:\n1) English\n2) فارسی\nChoice (1-2) [default: 1]: ",
    // Professional Error Handling
    errorTitle: "❌ Oops! Something went wrong during the execution.",
    errorTips: `💡 Troubleshooting Tips:
  1. Check your internet connection or VPN status.
  2. Ensure you successfully logged into your Cloudflare account in the browser.
  3. If it's a duplicate KV database error, you can safely ignore it.
  
  🔄 Please run the command again.`
  }
};

function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise(resolve => rl.question(query, ans => {
    rl.close();
    resolve(ans);
  }));
}

async function main() {
  const args = process.argv.slice(2);
  let lang = 'en';

  if (args.includes('fa') || args.includes('persian')) {
    lang = 'fa';
  } else if (args.includes('en') || args.includes('english')) {
    lang = 'en';
  } else {
    const choice = await askQuestion(i18n.en.selectLang);
    if (choice.trim() === '2') {
      lang = 'fa';
    }
  }

  const t = i18n[lang];
  console.log(`\n${t.welcome}\n`);

  try {
    console.log(t.checkingLogin);
    // استفاده از --no-save و --yes برای جلوگیری از توقف‌های ناخواسته npm
    execSync('npx --yes wrangler whoami', { stdio: 'inherit' });

    console.log(`\n${t.creatingKV}`);
    const kvOutput = execSync('npx --yes wrangler kv:namespace create "CONFIG_KV"', { encoding: 'utf-8' });
    const match = kvOutput.match(/id = "([a-f0-9]+)"/);

    if (match && match[1]) {
      const kvId = match[1];
      console.log(t.kvSuccess(kvId));

      console.log(t.updatingConfig);
      const wranglerPath = path.join(__dirname, '../wrangler.toml');
      if (fs.existsSync(wranglerPath)) {
        let wranglerContent = fs.readFileSync(wranglerPath, 'utf-8');
        wranglerContent = wranglerContent.replace(/id = ".*?"/, `id = "${kvId}"`);
        fs.writeFileSync(wranglerPath, wranglerContent);
      }
    }

    console.log(`\n${t.deploying}`);
    execSync('npx --yes wrangler deploy', { stdio: 'inherit' });

    console.log(`\n${t.success}\n`);

  } catch (error) {
    // گرفتن ارور و نمایش پیام کاستوم به جای استک‌تریس وحشتناک نود جی‌اس
    console.error(`\n${t.errorTitle}`);
    console.log(`${t.errorTips}\n`);
    // خروج از برنامه با کد 1 (نشان‌دهنده وجود خطا به سیستم‌عامل)
    process.exit(1);
  }
}

main();