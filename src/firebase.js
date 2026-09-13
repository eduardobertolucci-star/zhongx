import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyDPppMEYUYZr1tjmRjnI6dtPCl50_X9zfo",
  authDomain: "construcci-a0b44.firebaseapp.com",
  projectId: "construcci-a0b44",
  storageBucket: "construcci-a0b44.firebasestorage.app",
  messagingSenderId: "230145189487",
  appId: "1:230145189487:web:347650b800b4df5dda0f9a"
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
