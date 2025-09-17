// userAuth.js
import { auth } from "./firebase-config.js";
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

export function initAuth() {
  const googleBtn = document.getElementById("google-login-btn");
  const logoutBtn = document.getElementById("logout-btn");
  const authScreen = document.getElementById("auth-screen");
  const configScreen = document.getElementById("config-screen");

  const userPhoto = document.getElementById("user-photo");
  const userName = document.getElementById("user-name");
  const profileMenu = document.querySelector(".profile-menu");

  const provider = new GoogleAuthProvider();

  // Google Sign-In
  googleBtn?.addEventListener("click", async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      alert(error.message);
    }
  });

  // Logout
  logoutBtn?.addEventListener("click", async () => {
    await signOut(auth);
  });

  // Profile dropdown toggle
  userPhoto?.addEventListener("click", () => {
    profileMenu.classList.toggle("active");
  });

  // Listen for auth changes
  onAuthStateChanged(auth, (user) => {
    if (user) {
      authScreen.classList.remove("active");
      configScreen.classList.add("active");

      // Set profile info
      userName.textContent = user.displayName || "User";
      userPhoto.src = user.photoURL || "https://via.placeholder.com/40";
    } else {
      authScreen.classList.add("active");
      configScreen.classList.remove("active");

      // Reset profile info
      userName.textContent = "Guest";
      userPhoto.src = "https://via.placeholder.com/40";
    }
  });
}
