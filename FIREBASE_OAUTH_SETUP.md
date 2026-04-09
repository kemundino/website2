# 🔐 Firebase OAuth Setup Guide

## 🚨 Required: Enable OAuth Providers in Firebase Console

### **Step 1: Go to Firebase Console**
1. Visit: https://console.firebase.google.com/project/onfd-47648
2. Go to **Authentication** → **Sign-in method** tab

### **Step 2: Enable Google Provider**
1. Click on **Google** in the provider list
2. **Enable** the toggle switch
3. **Project public-facing name:** `BiteBuzz Restaurant`
4. **Project support email:** `your-email@example.com` (use your email)
5. Click **"Save"**

### **Step 3: Enable GitHub Provider**
1. Click on **GitHub** in the provider list
2. **Enable** the toggle switch
3. You'll need to:
   - **Client ID:** Get from GitHub OAuth App
   - **Client Secret:** Get from GitHub OAuth App

### **Step 4: Create GitHub OAuth App**
1. Go to GitHub → Settings → Developer settings → OAuth Apps
2. Click **"New OAuth App"**
3. **Application name:** `BiteBuzz Restaurant`
4. **Homepage URL:** `https://website2-qu0p.onrender.com`
5. **Authorization callback URL:** `https://website2-qu0p.onrender.com`
6. Click **"Register application"**
7. **Copy Client ID** and **Generate Client Secret**
8. **Paste these** into Firebase GitHub provider settings

## 🔧 OAuth Configuration Summary

### **Google Provider:**
- ✅ No additional setup required
- ✅ Just enable in Firebase Console
- ✅ Works immediately after enabling

### **GitHub Provider:**
- ⚠️ Requires GitHub OAuth App creation
- ⚠️ Need Client ID and Client Secret
- ✅ Works after GitHub app is configured

## 🎯 Testing OAuth Login

### **After Setup:**
1. **Deploy your updated code** to Render
2. **Go to your login page:** `https://website2-qu0p.onrender.com/auth`
3. **Click "Continue with Google"** - Should work immediately
4. **Click "Continue with GitHub"** - Works after GitHub OAuth setup

### **Expected Behavior:**
- ✅ **Google:** Popup opens → Select Google account → Auto-login
- ✅ **GitHub:** Popup opens → Authorize app → Auto-login
- ✅ **New Users:** Automatically get `customer` role
- ✅ **Profile Data:** Name, email, and avatar imported automatically

## 🛠️ Troubleshooting

### **Google Login Issues:**
- **Popup blocked:** Enable popups for your site
- **No redirect:** Check authorized domains in Firebase
- **Error:** Ensure Google provider is enabled

### **GitHub Login Issues:**
- **Invalid client:** Check GitHub OAuth App settings
- **Redirect URI mismatch:** Ensure callback URL matches exactly
- **Permissions denied:** Check GitHub app permissions

### **General Issues:**
- **CORS errors:** Add your domain to Firebase authorized domains
- **Network errors:** Check internet connection and firewall
- **Auth state not persisting:** Check browser cookies/localStorage

## 📱 Mobile OAuth Testing

### **On Mobile Devices:**
- OAuth works the same way on mobile
- Popups may open in new tabs instead of windows
- Ensure mobile browser allows popups
- Test both Safari (iOS) and Chrome (Android)

## 🔒 Security Notes

### **OAuth Security:**
- ✅ Firebase handles token security automatically
- ✅ No passwords stored for OAuth users
- ✅ Tokens are managed by Firebase Auth
- ✅ Users can revoke access anytime

### **Best Practices:**
- Keep GitHub client secret secure
- Regularly review authorized OAuth apps
- Monitor authentication logs in Firebase
- Use HTTPS (already configured with Render)

## 🎉 Success Indicators

### **When OAuth is Working:**
- ✅ Google button signs users in instantly
- ✅ GitHub button signs users in instantly
- ✅ User profiles created automatically
- ✅ Avatar images imported from OAuth providers
- ✅ Cross-device authentication works

### **User Experience:**
- **Fast:** No password required for OAuth users
- **Secure:** Enterprise-grade authentication
- **Professional:** Modern login experience
- **Mobile-friendly:** Works on all devices

## 📋 Final Checklist

### **Before Testing:**
- [ ] Enable Google provider in Firebase Console
- [ ] Create GitHub OAuth App
- [ ] Add GitHub credentials to Firebase
- [ ] Deploy updated code to Render
- [ ] Add domain to authorized domains

### **After Testing:**
- [ ] Google login works on desktop
- [ ] GitHub login works on desktop
- [ ] OAuth works on mobile devices
- [ ] User profiles created correctly
- [ ] Avatar images display properly

**Your professional OAuth login system will be ready after completing these steps!** 🔐
