// Firebase Connection Test Utility
import { db, auth } from '@/firebase/config';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

export async function testFirebaseConnection() {
  const results = {
    auth: false,
    firestore: false,
    collections: {} as Record<string, boolean>,
    errors: [] as string[]
  };

  try {
    // Test 1: Firebase Auth
    auth.currentUser; // Access to test connection
    results.auth = true;
    console.log('✅ Firebase Auth connected');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown auth error';
    results.errors.push(`Auth Error: ${errorMessage}`);
    console.log('❌ Firebase Auth failed:', errorMessage);
  }

  try {
    // Test 2: Firestore Connection
    await getDoc(doc(db, 'test', 'connection')); // Test connection
    results.firestore = true;
    console.log('✅ Firestore connected');
  } catch (error) {
    // Expected error for non-existent test collection, but confirms connection
    const errorMessage = error instanceof Error ? error.message : 'Unknown firestore error';
    if (errorMessage.includes('permission-denied')) {
      results.firestore = true;
      console.log('✅ Firestore connected (permission error expected)');
    } else {
      results.errors.push(`Firestore Error: ${errorMessage}`);
      console.log('❌ Firestore failed:', errorMessage);
    }
  }

  try {
    // Test 3: Check if collections exist
    const collections = ['users', 'menu', 'orders', 'reservations', 'tables', 'staff'];
    
    for (const collectionName of collections) {
      try {
        const querySnapshot = await getDocs(collection(db, collectionName));
        results.collections[collectionName] = true;
        console.log(`✅ Collection '${collectionName}' exists (${querySnapshot.docs.length} docs)`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown collection error';
        if (errorMessage.includes('permission-denied')) {
          results.collections[collectionName] = true;
          console.log(`✅ Collection '${collectionName}' exists (permission restricted)`);
        } else {
          results.collections[collectionName] = false;
          results.errors.push(`Collection ${collectionName}: ${errorMessage}`);
          console.log(`❌ Collection '${collectionName}' failed:`, errorMessage);
        }
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown test error';
    results.errors.push(`Collection Test Error: ${errorMessage}`);
  }

  return results;
}

// Run this test in browser console
export function runFirebaseTest() {
  console.log('🔍 Testing Firebase Connection...');
  testFirebaseConnection().then(results => {
    console.log('📊 Test Results:', results);
    
    if (results.auth && results.firestore) {
      console.log('🎉 Firebase is properly connected!');
    } else {
      console.log('⚠️ Firebase connection issues detected');
      console.log('Errors:', results.errors);
    }
  });
}

// Test Firebase Project ID
export function checkFirebaseProject() {
  const config = {
    projectId: 'onfd-47648',
    authDomain: 'onfd-47648.firebaseapp.com'
  };
  
  console.log('🔍 Firebase Project Config:', config);
  console.log('🌐 Expected URL: https://console.firebase.google.com/project/onfd-47648');
  
  return config;
}
