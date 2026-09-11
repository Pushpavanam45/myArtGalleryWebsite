import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD5NA-D7XlzjA7h4lw6T6U5eGVHmFyrEDw",
  authDomain: "artgallery-69371.firebaseapp.com",
  projectId: "artgallery-69371",
  storageBucket: "artgallery-69371.firebasestorage.app",
  messagingSenderId: "557779537212",
  appId: "1:557779537212:web:ef6446c478b915e75da239",
  measurementId: "G-DZ5LJSH7Y4"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
