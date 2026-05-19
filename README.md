# The Intelligent Bistro

A state-of-the-art, AI-native gourmet dining and concierge-assisted food delivery application. Combining high-fidelity design aesthetics, smooth micro-interactions, real-time Cloud Firestore synchronization, and an autonomous, intelligent Gemini 2.5-powered concierge.

Built using **Expo (React Native & Web)**, a lightweight **Express.js backend**, and **Google Firebase (Auth & Firestore)**.

---
##ARCHITECTURE 
https://lucid.app/lucidchart/17bd13e1-f1bf-4430-8415-98487dd15ddf/edit?invitationId=inv_5538de39-f2bb-4ca1-95b9-18285b58764c

##Features

- **Autonomous AI Concierge**: Powered by the **Google GenAI SDK (Gemini 2.5 Flash)** with strict JSON schema outputs. It acts as an elite maître d'—capable of adding/removing items from your cart, recommending dishes, directing you to checkout, and engaging in charming, witty off-topic banter before seamlessly pivoting back to the menu!
- **Resilient Fallback Engine**: If Gemini API quotas are reached or the server is offline, the backend engages a high-performance **natural language fallback compiler** to process orders, cater to cravings, suggest desserts, and process complex text commands flawlessly.
- **Real-Time Address Book (Optimistic UI)**: Add, edit, delete, and manage multiple delivery locations with zero visual latency. Uses **Zustand + Cloud Firestore** to achieve immediate **0ms local UI render times** while updating the database in the background. Handles multi-default flags automatically!
- **Elite Checkout Experience**: Smooth Apple Pay, credit card, and digital wallet payment integration, backed by beautiful haptic feedback, safe area insets, and micro-animations.
- **Transactional Emailing**: Integrated with **Nodemailer** to send stunning HTML-styled order confirmations and live delivery simulation emails, featuring online mail preview links (via Ethereal Mail).
- **Curated Luxury Aesthetics**: Premium dark/cream typography (`Playfair Display` / `Inter`), iOS-like glassmorphic blur sheets, subtle card gradients, and smooth native animations powered by **React Native Reanimated**.

---

## Tech Stack

- **Frontend Framework**: [Expo](https://expo.dev/) (React Native & Web)
- **Navigation**: Expo Router (File-based routing)
- **State Management**: Zustand + MMKV Persist
- **AI Core**: Google GenAI SDK (`gemini-2.5-flash`)
- **Backend API Server**: Node.js + Express.js + TSX
- **Database & Auth**: Google Firebase (Authentication & Cloud Firestore)
- **Transactional Services**: Nodemailer + SMTP Emailer
- **Styling & Icons**: Custom StyleSheet, Reanimated 4, Lucide Icons

---

## Project Structure

```
/TheIntelligentBistro
 ├── /app                   # Expo Router screens (Tabs, Cart, Checkout, Auth, Addresses)
 ├── /backend               # Express.js API Server, Firebase Admin endpoints & emailers
 ├── /ai                    # Gemini 2.5 AI Agent core system instructions and schema
 ├── /frontend
 │    ├── /components       # UI components (Skeleton, SmartImage, CheckoutDrawer, FilterModal)
 │    ├── /data             # Static local asset structures and gourmet menu
 │    ├── /lib              # Firebase client initialized configuration & MMKV storage
 │    └── /stores           # Zustand global state models (Cart, Auth, Address, Order)
 ├── .gitignore             # Strict exclusion list (ignores env files and logs)
 └── package.json           # Dual-mode launch script concurrently starting Metro + API Server
```

---

## Getting Started

### 1. Prerequisites
Ensure you have **Node.js (v18+)** and **npm** installed on your system.

### 2. Installation
Clone the repository and install dependencies:
```bash
cd TheIntelligentBistro
npm install
```

### 3. Setup Environment Variables
Create a `.env.local` file in the root directory (this is automatically ignored by Git and will never be pushed to your repository):
```env
# Google Gemini API Key
GEMINI_API_KEY="your-gemini-api-key"

# App Hosting URL
APP_URL="http://localhost:3000"

# (Optional) Custom SMTP Mail Settings for Real Emails
# SMTP_HOST="smtp.gmail.com"
# SMTP_PORT=587
# SMTP_USER="your-email@gmail.com"
# SMTP_PASS="your-app-password"
```

### 4. Running the Application
Launch both the **Express API Server** and the **Expo Metro Bundler** concurrently with a single command:
```bash
npm run dev
```
- **Web App**: Accessible at [http://localhost:8081](http://localhost:8081)
- **API Server**: Accessible at [http://localhost:3000](http://localhost:3000)

---

## Security Audit & Safe Pushing
This codebase has been thoroughly audited for security to guarantee **no sensitive credentials or private keys are committed**:
- All personal keys, Gemini API tokens, and credentials reside strictly in `.env.local`.
- `.gitignore` is pre-configured with the wildcard pattern `.env*` to prevent accidental pushing of secrets.
- The `firebase-applet-config.json` only contains standard client-side public Firebase parameters (non-secret), making it safe to commit.

---

*Made with 🤎 for The Intelligent Bistro.*
