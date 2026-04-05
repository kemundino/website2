# 🔥 Firebase Setup Instructions

## 📋 Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: `bitebuzz-restaurant`
4. Enable Google Analytics (optional)
5. Click "Create project"

## 📋 Step 2: Enable Authentication

1. In Firebase Console, go to "Authentication" → "Get started"
2. Enable "Email/Password" sign-in method
3. Save settings

## 📋 Step 3: Create Firestore Database

1. Go to "Firestore Database" → "Create database"
2. Choose "Start in test mode" (for development)
3. Select a location (choose closest to your users)
4. Click "Create database"

## 📋 Step 4: Get Firebase Configuration

1. Go to Project Settings (⚙️ icon)
2. Under "Your apps", click "Web"
3. Copy the Firebase configuration object
4. Replace the placeholder config in `src/firebase/config.ts`

## 📋 Step 5: Update Firebase Configuration

Replace the content of `src/firebase/config.ts` with your actual config:

```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
```

## 📋 Step 6: Setup Firestore Security Rules

Go to Firestore → Rules and replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Only admins can read/write all users
    match /users/{userId} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Anyone can read menu items
    match /menu/{itemId} {
      allow read: if true;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Users can read/write their own orders
    match /orders/{orderId} {
      allow read, write: if request.auth != null && 
        (request.auth.uid == resource.data.userId || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
    
    // Anyone can read/write feedback (for demo)
    match /feedback/{feedbackId} {
      allow read, write: if true;
    }
    
    // Only admins can manage tables, reservations, staff
    match /tables/{tableId} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    match /reservations/{reservationId} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    match /staff/{staffId} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

## 📋 Step 7: Run Your Application

```bash
npm run dev
```

## 🎉 Migration Complete!

Your restaurant system now uses Firebase for:
- ✅ **Authentication** - Secure user login/registration
- ✅ **Real-time Database** - Live data synchronization
- ✅ **Cloud Storage** - Persistent data storage
- ✅ **Security Rules** - Protected user data

## 🔄 Data Migration

Your existing localStorage data will NOT be automatically migrated. You'll need to:

1. **Create an admin account** through the registration page
2. **Add menu items** through the admin panel
3. **Set up tables, staff, etc.** through the respective admin sections

## 🚀 Benefits of Firebase

- **Real-time Updates** - Orders sync instantly across devices
- **Multi-device Support** - Use your system on multiple devices
- **Data Persistence** - No more data loss on browser clear
- **Security** - Proper authentication and data protection
- **Scalability** - Grows with your business
- **Offline Support** - Works even without internet

## 📱 Next Steps

1. Test all functionality with Firebase
2. Create admin and customer accounts
3. Add menu items through admin panel
4. Test real-time features across multiple browser tabs
5. Deploy to production when ready

## 🔧 Troubleshooting

**If you get "Firebase configuration not found" error:**
- Make sure you've replaced the config in `src/firebase/config.ts`
- Check that all required fields are filled

**If authentication doesn't work:**
- Ensure Email/Password sign-in is enabled in Firebase Console
- Check your security rules

**If data doesn't sync:**
- Check Firestore rules
- Ensure you're logged in
- Check browser console for errors

---

**🎉 Congratulations! Your restaurant system is now powered by Firebase!**
