# ⚡ SupaCompanion — The Black Carbon Supabase Mobile Manager

<div align="center">

[![Build Android APK](https://github.com/placeholder/supa-companion/actions/workflows/build-apk.yml/badge.svg)](https://github.com/placeholder/supa-companion/actions)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-v2-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**A sleek, futuristic, security-first developer companion for managing Supabase databases, authentication, SQL, and storage directly from Android & mobile devices.**

*Crafted with a minimalist Black Carbon aesthetic inspired by v0, Linear, and Google AI Studio.*

[Live Demo](#quick-start) • [Features](#key-features) • [Android APK Build](#android-apk-build--cicd) • [Security Model](#security--privacy-architecture)

</div>

---

## 🌟 Overview

Following the success of the **Vercel Android Companion**, **SupaCompanion** brings full Supabase developer control to mobile screens with a high-performance, touch-optimized user experience. Whether you're on the go, debugging production tables from Termux, or monitoring database latency, SupaCompanion provides an instant, responsive bridge to your Supabase instances.

---

## 🚀 Key Features

### 1. 🗄️ Table Editor & Data Explorer
- **Adaptive Mobile Views:** Seamlessly switch between touch-friendly **Card View** and high-density **Table Grid View**.
- **Real-Time Search & Pagination:** Instant client-side & server-side search across record payloads.
- **Full CRUD:** Insert new rows with auto-generated schema forms, update existing records, or safely delete rows.
- **One-Tap Data Export:** Export table datasets to **CSV** and **JSON** formatted downloads directly to your device storage.

### 2. 💻 Interactive SQL Console
- **Query Runner:** Execute PostgreSQL statements directly against your Supabase database.
- **Benchmark Latency:** Track execution latency (`⚡ 28ms`) and affected row counts.
- **Preset Snippets:** Instant query presets for user counts, active connections, indexing status, and audit logs.
- **History Drawer:** Preserves recent queries for 1-tap recall.

### 3. 👥 Auth & Users Directory
- **User Discovery:** Search auth users by email, phone, provider, or UUID.
- **Identity Inspector:** Inspect raw user metadata, app metadata, and OAuth providers (GitHub, Google, Email).
- **User Invitations:** Send invitation emails or simulate auth enrollments.
- *Requires Service Role Key for elevated administrative privileges.*

### 4. 📦 Storage Buckets Explorer
- **Bucket Browser:** View public and private storage buckets with quota limit badges.
- **File Inspector:** Inspect file sizes, MIME types, and update timestamps.
- **1-Tap Shareable Links:** Copy public CDN URLs instantly to clipboard.
- **Image Lightbox:** Preview images and graphics directly within the app.

### 5. ⚡ Real-Time Connection Health & Benchmarking
- **Round-Trip Ping:** Live latency monitor testing PostgREST response times.
- **Sparkline Latency Graph:** Visual history of connection stability.
- **Security Audit Checklist:** Verifies TLS 1.3 encryption, client-side sandbox isolation, and RLS advisories.

### 6. 🌐 Multi-Workspace Switcher
- Manage multiple Supabase projects (Production, Staging, Dev).
- Includes an instant **Interactive Demo Mode** (Acme Cloud) so reviewers can test all features without entering API keys.

---

## 🔒 Security & Privacy Architecture

SupaCompanion is architected with a strict **Zero-Telemetry, Client-Only Sandbox**:
- **Direct REST Calls:** All queries connect directly from your device browser/app to your Supabase project endpoint (`https://xyz.supabase.co/rest/v1/`).
- **No Middleman Servers:** There are no intermediate proxy servers, tracking APIs, or remote databases.
- **Local Storage Isolation:** Project URLs and API keys are stored exclusively in your local device sandbox.

---

## 📱 Android APK Build & CI/CD

This repository includes an automated **GitHub Actions CI/CD pipeline** (`.github/workflows/build-apk.yml`). 

Whenever you push to `main` or trigger the workflow manually:
1. GitHub runners build the production web bundle.
2. Capacitor generates the Android project with Gradle.
3. A ready-to-install **`app-debug.apk`** is compiled and made available for download in the **Actions Artifacts** tab!

### Generating APK Locally:
```bash
# 1. Build web distribution
npm run build

# 2. Sync to Capacitor
npx cap sync android

# 3. Open in Android Studio or compile with Gradle
cd android && ./gradlew assembleDebug
```

---

## 🛠️ Quick Start (Local & Termux)

### Prerequisites:
- Node.js 18+
- npm 9+

### Installation:
```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/supa-companion.git
cd supa-companion

# Install dependencies
npm install

# Start development server
npm run dev
```

If running in **Termux on Android**:
```bash
# Open directly in mobile browser:
termux-open-url http://localhost:5173
```

---

## 📦 Tech Stack

- **Framework:** React 18 with TypeScript
- **Bundler:** Vite 6
- **Styling:** Tailwind CSS (Custom Black Carbon palette)
- **Icons:** Lucide React
- **SDK:** `@supabase/supabase-js` v2 & direct PostgREST OpenAPI
- **Mobile Engine:** CapacitorJS Android Bridge

---

## 📄 License

MIT License © 2026. Built with ❤️ for the developer community.
