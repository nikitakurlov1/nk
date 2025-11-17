import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

// Firebase конфигурация
// ВАЖНО: Замените эти значения на свои из Firebase Console
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
}

// Инициализация Firebase
const app = initializeApp(firebaseConfig)

// Инициализация Firestore
export const db = getFirestore(app)
