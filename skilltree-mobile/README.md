# SkillTree Mobile (Expo / React Native)

## Setup
1) Install Node.js LTS
2) Install Expo Go on your phone (App Store / Play Store)
3) In this folder:
   npm install
   cp .env.example .env
   # edit .env and set EXPO_PUBLIC_API_URL to your backend URL
   npx expo start

## Run on a physical phone
- Use Expo Go and scan the QR code shown in the terminal.

## Backend endpoints used
- POST /api/register
- POST /api/login
- GET /api/verify/:token
