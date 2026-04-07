# 🔥 Firebase Issues Fix Guide

## ❌ Issue 1: "No account found" despite user in Firestore

### **Root Cause:**
Firebase Authentication and Firestore are separate systems:
- **Authentication**: Handles login/password (users must be created here)
- **Firestore**: Stores user profiles/data (separate from auth)

### **Solution: Create Users Properly**

#### **Option A: Create Test User via Authentication**
1. Go to Firebase Console → Authentication → Users tab
2. Click **"Add user"**
3. Enter email and password
4. This creates BOTH auth account AND you can manually add profile to Firestore

#### **Option B: Use Signup Form**
1. Go to your app signup page
2. Create new account
3. This automatically creates both auth + Firestore profile

#### **Option C: Fix Existing Firestore User**
If you have a user in Firestore but no Authentication:
1. Delete the user from Firestore
2. Create user through Authentication first
3. System will auto-create Firestore profile on signup

## ❌ Issue 2: Items disappear on refresh

### **Root Cause:**
Data not properly saving to Firestore or connection issues

### **Diagnostic Steps:**

#### **Step 1: Check Firebase Connection**
```javascript
// In browser console on your site
import { db } from '/src/firebase/config.js';
import { collection, getDocs } from 'firebase/firestore';

// Test connection
try {
  const snapshot = await getDocs(collection(db, 'menu'));
  console.log('✅ Connected to Firestore');
  console.log('📊 Menu items:', snapshot.docs.length);
} catch (error) {
  console.log('❌ Connection failed:', error.message);
}
```

#### **Step 2: Check Data Persistence**
1. Add an item through your app
2. Open Firebase Console → Firestore → menu collection
3. Check if item appears there immediately
4. If not, there's a save issue

#### **Step 3: Check Firestore Rules**
Go to Firebase Console → Firestore → Rules tab:
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

## 🔧 Immediate Fixes

### **Fix 1: Create Proper Test User**
1. **Go to:** https://console.firebase.google.com/project/onfd-47648/authentication
2. **Click:** "Add user" 
3. **Enter:** test@example.com / password123
4. **Save:** This creates Authentication account
5. **Test:** Try logging in with these credentials

### **Fix 2: Check Data Saving**
Add this test to see if data saves:
```javascript
// In browser console after logging in
import { db } from '/src/firebase/config.js';
import { collection, addDoc } from 'firebase/firestore';

try {
  const docRef = await addDoc(collection(db, 'menu'), {
    name: 'Test Item',
    price: 10.99,
    category: 'test',
    createdAt: new Date()
  });
  console.log('✅ Test item saved:', docRef.id);
} catch (error) {
  console.log('❌ Save failed:', error.message);
}
```

### **Fix 3: Verify Environment Variables**
Check that Render has these environment variables:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_AUTH_DOMAIN`
- etc.

## 🎯 Expected Results

### **After Fix 1:**
- ✅ Can login with test@example.com / password123
- ✅ User appears in both Authentication and Firestore

### **After Fix 2:**
- ✅ Test item appears in Firestore immediately
- ✅ Items persist after page refresh
- ✅ Data syncs across devices

## 🚨 If Still Not Working

### **Check These:**
1. **Firebase Project ID:** Must be exactly `onfd-47648`
2. **Authorized Domains:** Must include `website2-qu0p.onrender.com`
3. **Firestore Rules:** Must allow authenticated users
4. **Environment Variables:** All must be set in Render

### **Quick Test:**
1. Create user via Authentication (not Firestore)
2. Login with that user
3. Add a menu item
4. Check if it appears in Firestore
5. Refresh page - item should still be there

## 📞 Next Steps

1. **Try the test user creation** first
2. **Run the connection test** in console
3. **Check if items save** to Firestore
4. **Report back** with specific error messages

**This will fix both the login issue and data persistence problem!** 🔧
