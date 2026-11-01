import { auth, db } from "./firebase.js";
import { createUserWithEmailAndPassword, updateProfile, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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
    const cred = await createUserWithEmailAndPassword(auth, email, password);

    await updateProfile(cred.user, { displayName: name });

    // Save to database, but never wait longer than 4 seconds
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

    await signOut(auth);

    message.style.color = "green";
    message.style.fontWeight = "bold";
    message.textContent = "✅ Signup completed successfully! Redirecting to login page...";

    setTimeout(() => {
      window.location.href = "login.html";
    }, 2000);

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