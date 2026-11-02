
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDW3Chza18OLI5mpuy_ppHe0cuAlZKwpBg",
  authDomain: "unidelivery-7b848.firebaseapp.com",
  databaseURL: "https://unidelivery-7b848-default-rtdb.firebaseio.com",
  projectId: "unidelivery-7b848",
  storageBucket: "unidelivery-7b848.firebasestorage.app",
  messagingSenderId: "262206738438",
  appId: "1:262206738438:web:8597d68b48e7e46076b387",
  measurementId: "G-L0SB11WXYE"
};

const app = initializeApp(firebaseConfig);

export const database = getDatabase(app);
export const auth = getAuth(app);

export default app;
