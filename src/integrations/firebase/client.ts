// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBe07em02ARYaF9c_oBDgFurwXupVBPLFE",
  authDomain: "mydailylog-2fbda.firebaseapp.com",
  projectId: "mydailylog-2fbda",
  storageBucket: "mydailylog-2fbda.firebasestorage.app",
  messagingSenderId: "1031956091548",
  appId: "1:1031956091548:web:36095076c3757009bfd359",
  measurementId: "G-S02PBEBCZS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
