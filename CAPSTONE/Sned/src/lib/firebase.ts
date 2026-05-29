import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Palitan ang mga values na ito mula sa iyong Firebase Project Settings
const firebaseConfig = { 
  apiKey: "AIzaSyB-DH2u-X3QtlFYsbIkrExVYp1Alws-rG8",
  authDomain: "capstone-d1ebe.firebaseapp.com",
  projectId: "capstone-d1ebe",
  storageBucket: "capstone-d1ebe.firebasestorage.app",
  messagingSenderId: "740465701113",
  appId: "1:740465701113:web:fa88d6e5127e7b8a963228",
  measurementId: "G-MVCV212KYD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
