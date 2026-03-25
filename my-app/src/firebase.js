import { initializeApp }                               from 'firebase/app';
import { getAuth,
         createUserWithEmailAndPassword,
         signInWithEmailAndPassword,
         sendPasswordResetEmail,
         GoogleAuthProvider,
         signInWithPopup,
         onAuthStateChanged,
         signOut }                                     from 'firebase/auth';
import { getFirestore,
         doc, setDoc, getDoc, updateDoc,
         collection, getDocs, addDoc,
         onSnapshot, query, orderBy,
         serverTimestamp }                             from 'firebase/firestore';

const firebaseConfig = {
  apiKey:            process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain:        process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_ID,
  appId:             process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId:     process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

const app                  = initializeApp(firebaseConfig);
export const auth          = getAuth(app);
export const db            = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
  doc, setDoc, getDoc, updateDoc,
  collection, getDocs, addDoc,
  onSnapshot, query, orderBy,
  serverTimestamp,
};