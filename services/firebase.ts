// src/services/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Replace with YOUR config from Firebase Console
const firebaseConfig = {
    apiKey: "AIzaSyD_ZUovTDF2abkFgiuEwswsCEVO9XwjAJc",
  authDomain: "pumppal-authentication.firebaseapp.com",
  projectId: "pumppal-authentication",
  storageBucket: "pumppal-authentication.firebasestorage.app",
  messagingSenderId: "37006822370",
  appId: "1:37006822370:web:542a0442e6426ea1e0c7bb",
  measurementId: "G-KFEM0SN8WX"
               // Your actual app ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);