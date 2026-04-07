# 🔍 Firebase Connection Diagnostic Guide

## 🚨 Quick Check - Is Your Firebase Connected?

### **Step 1: Open Browser Console**
1. Go to your app: https://website2-qu0p.onrender.com
2. Press **F12** to open Developer Tools
3. Go to **Console** tab
4. Paste this code and press Enter:

```javascript
// Check Firebase Project
console.log('🔍 Firebase Project Check:');
console.log('Project ID:', 'onfd-47648');
console.log('Expected URL:', 'https://console.firebase.google.com/project/onfd-47648');

// Check if Firebase is loaded
if (window.firebase) {
  console.log('✅ Firebase SDK loaded');
} else {
  console.log('❌ Firebase SDK not loaded');
}
```

### **Step 2: Test Database Connection**
In the same console, paste:

```javascript
// Test Firestore connection
import { db } from '/src/firebase/config.js';
import { collection, getDocs } from 'firebase/firestore';

try {
  const querySnapshot = await getDocs(collection(db, 'users'));
  console.log('✅ Firestore connected!');
  console.log('📊 Users collection has:', querySnapshot.docs.length, 'documents');
} catch (error) {
  console.log('❌ Firestore connection failed:', error.message);
  
  if (error.message.includes('permission-denied')) {
    console.log('⚠️ Permission denied - check Firestore rules');
  }
  if (error.message.includes('not-found')) {
    console.log('⚠️ Project not found - check Project ID');
  }
}
```

## 🔧 Common Issues & Solutions:

### **Issue 1: Wrong Project ID**
**Error:** `7 PERMISSION_DENIED: Missing or insufficient permissions.`
**Solution:** 
1. Check if Project ID `onfd-47648` is correct
2. Go to: https://console.firebase.google.com
3. Verify you're in the right project

### **Issue 2: Firestore Not Created**
**Error:** `7 PERMISSION_DENIED: Missing or insufficient permissions.`
**Solution:**
1. Go to Firebase Console → Firestore Database
2. Click **"Create database"** if not created
3. Choose **"Start in test mode"** for now

### **Issue 3: Firestore Rules Too Restrictive**
**Error:** `7 PERMISSION_DENIED: Missing or insufficient permissions.`
**Solution:**
1. Go to Firestore → Rules tab
2. Replace with these rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### **Issue 4: Environment Variables Missing**
**Error:** Firebase config undefined
**Solution:**
1. Check Render environment variables
2. Ensure all `VITE_FIREBASE_*` variables are set

## 📊 Firebase Console Checklist:

### **1. Project Verification**
- [ ] Go to: https://console.firebase.google.com/project/onfd-47648
- [ ] Verify project name and ID match
- [ ] Check project is not disabled

### **2. Authentication Setup**
- [ ] Go to Authentication → Sign-in method
- [ ] Email/Password provider is **Enabled**
- [ ] Check if users exist in Users tab

### **3. Firestore Database**
- [ ] Firestore Database is created
- [ ] Rules allow read/write for authenticated users
- [ ] Check if data exists in collections

### **4. Authorized Domains**
- [ ] Go to Authentication → Settings
- [ ] `website2-qu0p.onrender.com` is added
- [ ] `localhost` is added for development

## 🚀 Quick Fix Steps:

### **If Nothing Works:**
1. **Create a new Firebase project** (fresh start)
2. **Update config.ts** with new project credentials
3. **Re-deploy** to Render
4. **Test again**

### **Test with Fresh Data:**
1. Go to Firebase Console → Authentication
2. Create a test user manually
3. Try logging in with that user
4. Check if user appears in Firestore users collection

## 🎯 Expected Results:

**✅ Working Connection:**
- Console shows "✅ Firestore connected!"
- Can see user count in users collection
- Login works on both devices
- Data syncs between devices

**❌ Connection Issues:**
- Console shows permission errors
- Cannot access collections
- Login fails
- No data synchronization

## 📞 If Still Not Working:

1. **Screenshot the console errors**
2. **Check Firebase project settings**
3. **Verify Render environment variables**
4. **Test with a simple Firebase connection**

**Run the diagnostic tests above and share the console results!** 🔍
