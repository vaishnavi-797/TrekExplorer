import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    // Not logged in, so send them to the login page
    window.location.href = "login.html";
    return;
  }

  document.getElementById("accEmail").textContent = user.email;

  // Show the display name right away
  document.getElementById("accName").textContent =
    user.displayName || "Not set";

  // Then try to get the name saved in the database
  try {
    const snap = await getDoc(doc(db, "users", user.uid));
    if (snap.exists() && snap.data().name) {
      document.getElementById("accName").textContent = snap.data().name;
    }
  } catch (error) {
    console.error("Could not load profile from database:", error);
  }
});

document.getElementById("accLogout").addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});