import { initializeApp, getApps, getApp }
    from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth }
    from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore }
    from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAhmGdEIv1PxYXr63KYPN41J_wW7wwVNR0",
  authDomain: "trekexplorer-a2fdf.firebaseapp.com",
  projectId: "trekexplorer-a2fdf",
  storageBucket: "trekexplorer-a2fdf.firebasestorage.app",
  messagingSenderId: "46252297439",
  appId: "1:46252297439:web:4c93a5ce3f7b0e5fac2d6a"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Separate app so an admin login does not sign the public website in.
const ADMIN_APP = "trekexplorer-admin";
const adminApp = getApps().some((a) => a.name === ADMIN_APP)
  ? getApp(ADMIN_APP)
  : initializeApp(firebaseConfig, ADMIN_APP);
export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp);