import { auth } from "./firebase.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const form = document.getElementById("loginForm");
const message = document.getElementById("loginMessage");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    message.style.color = "green";
    message.textContent = "Login successful! Redirecting...";
    setTimeout(() => (window.location.href = "index.html"), 1000);
  } catch (error) {
    message.style.color = "red";
    message.textContent = error.code + " : " + error.message;
  }
});