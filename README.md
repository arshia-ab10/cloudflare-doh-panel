# 🚀 Cloudflare DoH Panel

[![npm version](https://img.shields.io/npm/v/cloudflare-doh-panel.svg)](https://www.npmjs.com/package/cloudflare-doh-panel)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A high-performance, customizable DNS-over-HTTPS (DoH) Proxy and Management Panel built specifically for **Cloudflare Workers**.

> <img src="./assets/flags/ir.svg" width="22" height="15" valign="middle"> **فارسی:** برای مطالعه راهنمای فارسی [اینجا کلیک کنید](./README-fa.md).

---

## ✨ Features

* **⚡ One-Click CLI Deployer:** Automatically creates KV namespaces, configures `wrangler.toml`, and deploys to Cloudflare with a single command.
* **🌐 Multi-Language CLI:** Interactive installer supporting both **English** and **Persian (فارسی)**.
* **📦 Automatic Workers KV Setup:** Auto-generates and binds the `CONFIG_KV` namespace to store your settings.
* **🛡️ Friendly Error Handling:** Smart troubleshooting tips for network issues, timeouts, and Cloudflare logins.
* **🔒 DoH & Proxy Support:** Secure DNS-over-HTTPS proxying with custom filtering and caching.

---

## 🚀 Quick Start (Deployment)

You don't need to clone this repository manually! Just run the following command in your terminal:

```bash
npx cloudflare-doh-panel

```

### Direct Language Launch:

```bash
# Persian / فارسی
npx cloudflare-doh-panel fa

# English
npx cloudflare-doh-panel en

```

---

## 🛠️ How It Works (Behind the Scenes)

When you run `npx cloudflare-doh-panel`, the CLI utility automatically:

1. Checks and authenticates your Cloudflare account via `wrangler`.
2. Creates a dedicated Workers KV namespace named `CONFIG_KV`.
3. Extract the generated KV ID and updates your `wrangler.toml` file automatically.
4. Deploys theWorker script directly to your Cloudflare account.

---

## 💻 Manual Installation (For Developers)

If you wish to modify the code or contribute to the project:

```bash
# 1. Clone the repository
git clone https://github.com/arshia-ab10/cloudflare-doh-panel.git
cd cloudflare-doh-panel

# 2. Install dependencies
npm install

# 3. Test locally
npm run dev

# 4. Deploy manually
npm run deploy

```

---

## 📄 License

This project is open-source and available under the [MIT License](https://www.google.com/search?q=LICENSE).
