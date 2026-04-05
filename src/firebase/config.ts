// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCrw-lqoQ5_NbIyuDvEcihjzFEih-bE9eE",
  authDomain: "onfd-47648.firebaseapp.com",
  projectId: "onfd-47648",
  storageBucket: "onfd-47648.firebasestorage.app",
  messagingSenderId: "1076430300904",
  appId: "1:1076430300904:web:662c77393aec3ed9470b5d",
  measurementId: "G-YVMJN6C34J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

export default app;