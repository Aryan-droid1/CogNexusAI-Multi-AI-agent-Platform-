// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "cognexusai.firebaseapp.com",
  projectId: "cognexusai",
  storageBucket: "cognexusai.firebasestorage.app",
  messagingSenderId: "121267282476",
  appId: "1:121267282476:web:c003ecc2a7f37d8782e789",
  measurementId: "G-WM01V4L347"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth=getAuth(app);
const googleProvider=new GoogleAuthProvider();

export {auth,googleProvider};
