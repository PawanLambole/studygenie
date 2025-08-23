import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDH-vNtFe2yLEaH3lup-Q39qgj3XGg52B8",
  authDomain: "studygenie-aaad4.firebaseapp.com",
  projectId: "studygenie-aaad4",
  storageBucket: "studygenie-aaad4.firebasestorage.app",
  messagingSenderId: "174590249546",
  appId: "1:174590249546:web:20d2bebf9ba23f42b7f4b3",
  measurementId: "G-GVVG1E2VBH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase services to be used in other parts of the app
export const auth = getAuth(app);
export const db = getFirestore(app);
