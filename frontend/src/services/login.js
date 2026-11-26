import { auth } from "./firebase.js";
import { signInWithEmailAndPassword, signOut }
    from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const ADMIN_UID = "OYDXW9g1R3M3hS9ietRbRQXjRp63";

const form = document.getElementById("loginForm");
const message = document.getElementById("loginMessage");
const submitBtn = form.querySelector(".auth-submit");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  message.textContent = "";

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  submitBtn.disabled = true;
  submitBtn.textContent = "Logging in...";

  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);

    // Admin accounts must not log in on the public website
    if (cred.user.uid === ADMIN_UID) {
      await signOut(auth);
      submitBtn.disabled = false;
      submitBtn.textContent = "Login";
      message.style.color = "red";
      message.textContent = "Admin accounts can only log in from the admin panel.";
      return;
    }

    message.style.color = "green";
    message.style.fontWeight = "bold";
    message.textContent = "✅ Login successful! Taking you to the home page...";

    // On the home page the profile icon replaces the Login / Sign Up buttons
    setTimeout(() => {
      window.location.href = "index.html";
    }, 1000);

  } catch (error) {
    submitBtn.disabled = false;
    submitBtn.textContent = "Login";
    message.style.color = "red";

    if (
      error.code === "auth/invalid-credential" ||
      error.code === "auth/wrong-password" ||
      error.code === "auth/user-not-found"
    ) {
      message.textContent = "Incorrect email or password. Please try again.";
    } else if (error.code === "auth/invalid-email") {
      message.textContent = "Please enter a valid email.";
    } else if (error.code === "auth/too-many-requests") {
      message.textContent = "Too many attempts. Please wait a bit and try again.";
    } else if (error.code === "auth/network-request-failed") {
      message.textContent = "Network error. Check your internet connection.";
    } else {
      message.textContent = error.message;
    }
  }
});

// Password visibility toggle
document.querySelectorAll(".password-toggle-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const wrapper = btn.closest(".password-wrapper");
    const input = wrapper.querySelector("input");
    const isPassword = input.type === "password";
    input.type = isPassword ? "text" : "password";

    const eyeOpen = btn.querySelector(".eye-open");
    const eyeClosed = btn.querySelector(".eye-closed");
    if (eyeOpen && eyeClosed) {
      eyeOpen.style.display = isPassword ? "none" : "block";
      eyeClosed.style.display = isPassword ? "block" : "none";
    }
  });
});