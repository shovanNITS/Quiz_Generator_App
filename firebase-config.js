// firebase-config.js

// Import Firebase core + auth
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
// (optional) import analytics if you need
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-analytics.js";

// Your config (from Firebase console)
const firebaseConfig = {
  apiKey: "AIzaSyDgp7CeIrPcQdVJC-_hCQGVGmCbrwDpHQY",
  authDomain: "quiz-e2c7e.firebaseapp.com",
  projectId: "quiz-e2c7e",
  storageBucket: "quiz-e2c7e.firebasestorage.app",
  messagingSenderId: "494754241282",
  appId: "1:494754241282:web:6d2e49feed13d90d8c001b",
  measurementId: "G-VCWWF3ENEJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // ✅ use this for login/signup
const analytics = getAnalytics(app); // optional

export { auth };
