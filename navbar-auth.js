import { auth } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const authButtons = document.getElementById("authButtons");
const loggedOutHTML = authButtons.innerHTML;

onAuthStateChanged(auth, (user) => {

  if (!user) {
    console.log("navbar-auth: no user logged in");
    authButtons.innerHTML = loggedOutHTML;
    return;
  }

  console.log("navbar-auth: logged in as", user.email);

  const fullName = user.displayName || user.email.split("@")[0];
  const firstName = fullName.split(" ")[0];

  authButtons.innerHTML = `
    <div class="user-menu">
      <button class="user-btn" id="userBtn">
        <span class="avatar">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
            <circle cx="12" cy="8" r="4"/>
            <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8H4z"/>
          </svg>
        </span>
        <span class="user-name" id="userNameText"></span>
        <span class="arrow">▾</span>
      </button>

      <div class="dropdown" id="dropdown">
        <div class="dropdown-header">
          <strong id="ddName"></strong>
          <small id="ddEmail"></small>
        </div>
        <a href="account.html">👤 My Account</a>
        <a href="#" id="logoutBtn">🚪 Logout</a>
      </div>
    </div>
  `;

  document.getElementById("userNameText").textContent = firstName;
  document.getElementById("ddName").textContent = fullName;
  document.getElementById("ddEmail").textContent = user.email;

  const dropdown = document.getElementById("dropdown");

  document.getElementById("userBtn").addEventListener("click", (e) => {
    e.stopPropagation();
    dropdown.classList.toggle("show");
  });

  document.addEventListener("click", () => dropdown.classList.remove("show"));

  document.getElementById("logoutBtn").addEventListener("click", async (e) => {
    e.preventDefault();
    await signOut(auth);
    window.location.href = "index.html";
  });
});