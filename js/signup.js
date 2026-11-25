import { auth, db } from "./firebase.js";
import { createUserWithEmailAndPassword, updateProfile }
    from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { doc, setDoc, serverTimestamp }
    from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const form = document.getElementById("signupForm");
const message = document.getElementById("signupMessage");
const submitBtn = form.querySelector(".auth-submit");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  message.textContent = "";

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  if (password !== confirmPassword) {
    message.style.color = "red";
    message.textContent = "Passwords do not match.";
    return;
  }

  if (password.length < 6) {
    message.style.color = "red";
    message.textContent = "Password must be at least 6 characters.";
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Creating account...";

  try {
    // 1. Create the account (the user is now signed in automatically)
    const cred = await createUserWithEmailAndPassword(auth, email, password);

    // 2. Save the full name so the profile icon can show the first letter
    await updateProfile(cred.user, { displayName: name });

    // 3. Save to database, but never wait longer than 4 seconds
    try {
      await Promise.race([
        setDoc(doc(db, "users", cred.user.uid), {
          name: name,
          email: email,
          createdAt: serverTimestamp(),
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Database timeout")), 4000)
        ),
      ]);
    } catch (dbError) {
      console.error("Could not save user to database:", dbError);
    }

    // 4. Stay logged in and go to the home page, where the profile icon appears
    message.style.color = "green";
    message.style.fontWeight = "bold";
    message.textContent = "✅ Account created! Taking you to the home page...";

    setTimeout(() => {
      window.location.href = "index.html";
    }, 1500);

  } catch (error) {
    submitBtn.disabled = false;
    submitBtn.textContent = "Create Account";
    message.style.color = "red";

    if (error.code === "auth/email-already-in-use") {
      message.textContent = "This email is already registered. Please login.";
    } else if (error.code === "auth/invalid-email") {
      message.textContent = "Please enter a valid email.";
    } else if (error.code === "auth/weak-password") {
      message.textContent = "Password is too weak.";
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