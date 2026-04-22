import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyB4qmLmXayCWbGK43RNcZ0Q0KEY57nIX7w",

  authDomain: "parts-marketplace.firebaseapp.com",

  projectId: "parts-marketplace",

  storageBucket: "parts-marketplace.firebasestorage.app",

  messagingSenderId: "107879344610",

  appId: "1:107879344610:web:ed63f09a821573d02631bb",

  measurementId: "G-GVX0DF44DD",
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
