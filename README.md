# The Intelligent Bistro

A production-ready, ultra-premium MVP for an AI-native restaurant ordering app.

## Tech Stack
- Frontend: React 19, Vite, Tailwind CSS, Framer Motion
- State Management: Zustand
- Backend: Node.js + Express
- AI: Google GenAI SDK (Gemini) with Structured JSON Output

## Features
- **Premium Onboarding**: Immersive cinematic splash screen reveal.
- **Glassmorphism UI**: Beautiful iOS-like blur effects and card gradients.
- **AI Concierge**: An intelligent floating assistant that acts autonomously, manages cart state via natural language, and offers high-end dining recommendations.
- **Micro-interactions**: Hover effects, spring physics, and shared Layout animations on the shopping cart.
- **Resilient AI Layer**: Fallback mechanisms when API quotas are hit, strict Zod-like JSON schema adherence via the Gemini SDK.

## Structure
```
/src
 ├── /components
 │    ├── AiConcierge.tsx
 │    ├── CartDrawer.tsx
 │    ├── FoodCard.tsx
 │    └── FoodDetailModal.tsx
 ├── /data
 │    └── menu.ts
 ├── /stores
 │    └── useCartStore.ts
 ├── /services
 │    └── api.ts
 ├── App.tsx
 ├── index.css
 └── main.tsx
/server.ts
```

## Running the app
```bash
# Start backend and frontend concurrently
npm run dev
```
