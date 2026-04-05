// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDMcUauUVvcB8bvLeH4ZkZCnWGaaP9QGzM",
  authDomain: "bitebuzz-restaurant.firebaseapp.com",
  projectId: "bitebuzz-restaurant",
  storageBucket: "bitebuzz-restaurant.firebasestorage.app",
  messagingSenderId: "250541683466",
  appId: "1:250541683466:web:e502b14bce74b2451fc0f3",
  measurementId: "G-VL7K1664ZD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

export default app;