import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyC0qhOhbQG4oz79eBcNUKu981zUkvHB9a0",
  authDomain: "landzfinancas.firebaseapp.com",
  projectId: "landzfinancas",
  storageBucket: "landzfinancas.firebasestorage.app",
  messagingSenderId: "491789624246",
  appId: "1:491789624246:web:6c92a872593a555660d717",
  measurementId: "G-RB10PN3LJH"
};

const app  = initializeApp(firebaseConfig);
export const db   = getFirestore(app);
export const auth = getAuth(app);