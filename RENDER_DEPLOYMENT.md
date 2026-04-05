# 🚀 Render Deployment Guide

## 📋 Prerequisites
- GitHub repository with your code
- Render account (Free tier available)
- Firebase project setup

## 🔧 Step 1: Prepare Your Code

### 1.1 Update Environment Variables
In your `render.yaml` file, update these values:
```yaml
envVars:
  - key: VITE_FIREBASE_API_KEY
    value: your-actual-firebase-api-key
  - key: VITE_FIREBASE_AUTH_DOMAIN
    value: your-project.firebaseapp.com
  - key: VITE_FIREBASE_PROJECT_ID
    value: your-actual-project-id
  # ... update all Firebase values
```

### 1.2 Test Local Build
```bash
npm run build
npm run preview
```

## 🔧 Step 2: Push to GitHub

```bash
git add .
git commit -m "Configure for Render deployment"
git push origin main
```

## 🔧 Step 3: Deploy to Render

### 3.1 Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Verify your email

### 3.2 Create New Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Select your restaurant repository
4. Configure settings:

**Basic Settings:**
- **Name**: `restaurant-app`
- **Region**: Choose closest to your users
- **Branch**: `main`
- **Root Directory**: Leave empty (or `/`)
- **Runtime**: `Static`

**Build Settings:**
- **Build Command**: `npm run build`
- **Publish Directory**: `dist`

**Advanced Settings:**
- **Auto-Deploy**: ✅ Enabled
- **Node Version**: `18` (or latest)

### 3.3 Add Environment Variables
In Render dashboard, add these environment variables:

```
NODE_ENV=production
VITE_FIREBASE_API_KEY=your-actual-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

## 🔧 Step 4: Deploy and Test

### 4.1 Trigger Deployment
- Click **"Manual Deploy"** → **"Deploy Latest Commit"**
- Wait for build to complete (2-3 minutes)

### 4.2 Test Your App
- Visit your Render URL: `https://restaurant-app.onrender.com`
- Test all features:
  - Navigation
  - Admin dashboard
  - Mobile responsiveness
  - Firebase authentication

## 🔧 Step 5: Custom Domain (Optional)

### 5.1 Add Custom Domain
1. In Render dashboard → **"Custom Domains"**
2. Add your domain: `yourrestaurant.com`
3. Update DNS records:
   ```
   Type: CNAME
   Name: @
   Value: cname.vercel-dns.com
   ```

### 5.2 SSL Certificate
- Render automatically provides free SSL
- Certificate issued within 24 hours

## 🔧 Troubleshooting

### Common Issues:

**Build Failed:**
```bash
# Check build logs in Render dashboard
# Common fixes:
- Update Node version
- Check for missing dependencies
- Verify Firebase config
```

**Blank Page:**
```bash
# Check console for errors
# Common fixes:
- Verify environment variables
- Check Firebase configuration
- Ensure build completed successfully
```

**Firebase Authentication Issues:**
```bash
# Verify Firebase project settings
# Check authorized domains in Firebase console
# Ensure API keys are correct
```

## 🔧 Performance Optimization

### Enable Caching:
Add to `vite.config.ts`:
```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          firebase: ['firebase', '@firebase/auth', '@firebase/firestore']
        }
      }
    }
  }
})
```

### Enable Compression:
Render automatically enables Gzip compression for static files.

## 🔧 Monitoring

### Render Dashboard:
- **Metrics**: Build time, deployment status
- **Logs**: Build logs, error logs
- **Services**: Service health status

### Firebase Console:
- **Authentication**: User sign-ups, sign-ins
- **Firestore**: Database operations
- **Hosting**: Traffic analytics

## 🎉 Success! 

Your restaurant app is now live on Render! 🚀

**Your URL**: `https://restaurant-app.onrender.com`

**Next Steps:**
- Monitor performance
- Set up custom domain
- Configure analytics
- Test all features thoroughly
