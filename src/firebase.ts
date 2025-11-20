// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  deleteDoc,
  serverTimestamp,
  type Unsubscribe,
  getDocs,
} from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAzY7wR61kyGNnoYyfQyI9sOeTJV_yjHYw",
  authDomain: "budget-tracker-project-fed13.firebaseapp.com",
  projectId: "budget-tracker-project-fed13",
  storageBucket: "budget-tracker-project-fed13.firebasestorage.app",
  messagingSenderId: "344365258942",
  appId: "1:344365258942:web:8b08a3e4de5270f69226ef",
  measurementId: "G-8K4L6MG63C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export {
  app,
  auth,
  db,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  fbSignOut,
  onAuthStateChanged,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  deleteDoc,
  serverTimestamp,
  getDocs,
};

export type { FirebaseUser, Unsubscribe };