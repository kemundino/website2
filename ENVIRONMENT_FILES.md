# 📁 Environment Files Guide

## 🔍 Environment Files Overview

### **1. .env.example** ✅
- **Purpose**: Template for environment variables
- **Safe to commit**: Yes (contains example values)
- **Used by**: Other developers as reference

### **2. .env.local** ✅
- **Purpose**: Your local development secrets
- **Safe to commit**: No (contains real API keys)
- **Used by**: Your local development only
- **Location**: Automatically ignored by Git

### **3. Render Environment Variables** 🚀
- **Purpose**: Production secrets
- **Safe to commit**: No (configured in Render dashboard)
- **Used by**: Your deployed app on Render
- **Configuration**: Already set in render.yaml

## 🔧 Environment Variables Explained

### **Firebase Configuration:**
```
VITE_FIREBASE_API_KEY=AIzaSyCrw-lqoQ5_NbIyuDvEcihjzFEih-bE9eE
VITE_FIREBASE_AUTH_DOMAIN=onfd-47648.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=onfd-47648
VITE_FIREBASE_STORAGE_BUCKET=onfd-47648.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=1076430300904
VITE_FIREBASE_APP_ID=1:1076430300904:web:662c77393aec3ed9470b5d
VITE_FIREBASE_MEASUREMENT_ID=G-YVMJN6C34J
```

### **API Configuration:**
```
VITE_API_URL=http://localhost:3000          # Local development
VITE_API_URL=https://your-app.onrender.com # Production (in Render)
```

### **Environment:**
```
NODE_ENV=development    # Local
NODE_ENV=production     # Production (in Render)
```

## 🚀 Deployment Ready!

### **For Local Development:**
```bash
npm run dev
```
Uses `.env.local` automatically

### **For Render Deployment:**
```bash
git add .
git commit -m "Update environment configuration"
git push origin main
```
Render automatically uses environment variables from `render.yaml`

## 🔐 Security Notes

- ✅ `.env.local` is ignored by Git (in .gitignore)
- ✅ Real API keys are never committed to repository
- ✅ Production secrets are stored securely in Render
- ✅ Template file (.env.example) is safe to share

## 🎯 Quick Test

Test your environment setup:
```bash
# Test local build
npm run build

# Test local preview
npm run preview
```

If successful, your environment is configured correctly! 🎉
