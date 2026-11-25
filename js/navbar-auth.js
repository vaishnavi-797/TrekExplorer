import { auth } from "./firebase.js";
import { onAuthStateChanged, signOut }
    from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

console.log("[navbar-auth] script loaded");

/* =====================================================================
   PART 1: NAVBAR  (edit BRAND and LINKS once, every page updates)
   Each page only needs:  <div id="navbar"></div>
   ===================================================================== */
const BRAND = { text: "TrekExplorer", icon: "🏔️", href: "index.html" };

const LINKS = [
    { label: "Home",     href: "index.html" },
    { label: "Treks",    href: "index.html#treks" },
    { label: "About",    href: "index.html#about" },
    { label: "Services", href: "index.html#services" },
    { label: "Contact",  href: "index.html#contact" },
];

const navCss = `
.tx-navbar{position:sticky;top:0;z-index:1000;display:grid;grid-template-columns:1fr auto 1fr;
  align-items:center;height:76px;padding:0 44px;background:rgba(255,255,255,.92);backdrop-filter:blur(16px);
  -webkit-backdrop-filter:blur(16px);border-bottom:1px solid rgba(226,232,240,.85);
  box-shadow:0 4px 20px -2px rgba(15,23,42,.05);font-family:'Plus Jakarta Sans',system-ui,-apple-system,sans-serif}
.tx-brand{justify-self:start;display:flex;align-items:center;gap:10px;font-family:'Outfit',sans-serif;
  font-size:24px;font-weight:800;color:#15803d;text-decoration:none;white-space:nowrap;letter-spacing:-.5px}
.tx-brand span{font-size:24px;filter:drop-shadow(0 2px 4px rgba(22,163,74,.25))}
.tx-links{justify-self:center;display:flex;align-items:center;gap:8px;margin:0;padding:0;list-style:none}
.tx-links a{font-size:14.5px;font-weight:600;color:#475569;text-decoration:none;padding:8px 16px;
  border-radius:9999px;transition:all .2s cubic-bezier(.16,1,.3,1)}
.tx-links a:hover{color:#15803d;background:rgba(21,128,61,.08)}
.tx-links a.active{color:#15803d;background:rgba(21,128,61,.12);font-weight:700}
.tx-right{justify-self:end;display:flex;align-items:center;gap:14px}
#authButtons{display:flex;align-items:center;gap:10px}
.tx-btn{padding:8px 18px;border-radius:10px;font-size:14px;font-weight:700;text-decoration:none;
  transition:all .2s cubic-bezier(.16,1,.3,1);display:inline-flex;align-items:center;justify-content:center}
.tx-btn.login{color:#334155;background:#fff;border:1.5px solid #cbd5e1}
.tx-btn.login:hover{color:#15803d;border-color:#15803d;background:#f0fdf4}
.tx-btn.signup{color:#fff;background:linear-gradient(135deg,#15803d,#16a34a);border:none;
  box-shadow:0 4px 12px rgba(22,163,74,.25)}
.tx-btn.signup:hover{background:linear-gradient(135deg,#14532d,#15803d);transform:translateY(-1px);
  box-shadow:0 6px 16px rgba(22,163,74,.35);color:#fff}
.tx-toggle{display:none;background:none;border:none;font-size:24px;line-height:1;cursor:pointer;color:#334155;
  padding:6px;border-radius:8px}
.tx-toggle:hover{background:#f1f5f9}

@media (max-width:900px){
  .tx-navbar{padding:0 24px;height:70px}
  .tx-links{gap:4px}
  .tx-links a{font-size:14px;padding:6px 12px}
  .tx-brand{font-size:21px}
}
@media (max-width:720px){
  .tx-navbar{grid-template-columns:auto 1fr auto;column-gap:12px}
  .tx-toggle{display:block;order:-1}
  .tx-brand{justify-self:start}
  .tx-right{justify-self:end}
  .tx-links{position:absolute;top:100%;left:0;right:0;flex-direction:column;gap:6px;padding:16px;
    background:rgba(255,255,255,.98);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);
    box-shadow:0 16px 32px rgba(0,0,0,.1);border-bottom:1px solid #e2e8f0;display:none}
  .tx-links.open{display:flex}
  .tx-links li{width:100%}
  .tx-links a{display:block;padding:12px 18px;border-radius:10px;font-size:15px;text-align:center}
}
`;

function buildNavbar() {
    const mount = document.getElementById("navbar");
    if (!mount) return; // page already has its own navbar with #authButtons

    const navStyle = document.createElement("style");
    navStyle.textContent = navCss;
    document.head.appendChild(navStyle);

    const page = location.pathname.split("/").pop() || "index.html";
    const items = LINKS.map((l) => {
        const isActive = !l.href.includes("#") && l.href === page;
        return `<li><a href="${l.href}"${isActive ? ' class="active"' : ""}>${l.label}</a></li>`;
    }).join("");

    mount.innerHTML = `
        <div class="tx-navbar" role="navigation">
            <a class="tx-brand" href="${BRAND.href}"><span>${BRAND.icon}</span>${BRAND.text}</a>
            <ul class="tx-links" id="txLinks">${items}</ul>
            <div class="tx-right">
                <div id="authButtons">
                    <a class="tx-btn login" href="login.html">Login</a>
                    <a class="tx-btn signup" href="signup.html">Sign Up</a>
                </div>
                <button class="tx-toggle" id="txToggle" aria-label="Menu">☰</button>
            </div>
        </div>`;

    const links = document.getElementById("txLinks");
    document.getElementById("txToggle").addEventListener("click", () => links.classList.toggle("open"));
    links.addEventListener("click", (e) => { if (e.target.tagName === "A") links.classList.remove("open"); });
}

buildNavbar(); // must run BEFORE we look for #authButtons below

/* =====================================================================
   PART 2: PROFILE ICON  (your existing code, unchanged)
   ===================================================================== */
const authButtons = document.getElementById("authButtons");
if (!authButtons) console.error("[navbar-auth] #authButtons not found on this page");

// ---- styles (injected, no CSS file needed) ----
const style = document.createElement("style");
style.textContent = `
.profile-wrap{position:relative}
.profile-icon{width:40px;height:40px;border-radius:50%;border:2.5px solid #fff;
  color:#fff;font-size:16px;font-weight:700;font-family:inherit;display:flex;align-items:center;
  justify-content:center;cursor:pointer;padding:0;box-shadow:0 3px 10px rgba(0,0,0,.15);
  transition:transform .2s ease,box-shadow .2s ease}
.profile-icon:hover{transform:scale(1.05);box-shadow:0 5px 14px rgba(0,0,0,.22)}
.profile-icon.big{width:68px;height:68px;font-size:32px;margin:0 auto 12px;cursor:default;
  border:3px solid #f1f5f9;box-shadow:0 4px 14px rgba(0,0,0,.12)}
.profile-menu{position:absolute;right:0;top:52px;width:270px;background:rgba(255,255,255,.98);
  backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);color:#0f172a;
  border-radius:20px;padding:22px 18px;text-align:center;
  box-shadow:0 20px 45px -10px rgba(15,23,42,.2),0 0 0 1px rgba(0,0,0,.06);z-index:1000;
  animation:pmFadeIn .2s ease}
@keyframes pmFadeIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
.profile-menu[hidden]{display:none}
.pm-name{font-weight:700;font-size:16px;color:#0f172a;margin-bottom:2px}
.pm-email{font-size:13px;color:#64748b;margin-bottom:16px;word-break:break-all}
.logout-btn{width:100%;padding:10px 14px;border:1px solid #e2e8f0;border-radius:12px;background:#fff;
  color:#334155;font-size:13.5px;font-weight:600;cursor:pointer;display:block;text-decoration:none;
  transition:all .2s ease;margin-bottom:8px}
.logout-btn:hover{background:#f8fafc;border-color:#cbd5e1}
#logoutBtn{color:#dc2626;border-color:#fecaca;background:#fff;margin-top:4px;margin-bottom:0}
#logoutBtn:hover{background:#fef2f2;border-color:#fca5a5}
`;
document.head.appendChild(style);

const COLORS = ["#1e5b4f", "#1a73e8", "#8e24aa", "#d84315", "#455a64", "#c2185b", "#6d4c41", "#3949ab"];
function colorFor(text) {
    let h = 0;
    for (const ch of text) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    return COLORS[h % COLORS.length];
}

function showProfile(user) {
    const name = user.displayName || (user.email || "User").split("@")[0];
    const initial = name.charAt(0).toUpperCase();
    const color = colorFor(name);

    authButtons.innerHTML = `
        <div class="profile-wrap">
            <button class="profile-icon" id="profileBtn" aria-label="Account" style="background:${color}"></button>
            <div class="profile-menu" id="profileMenu" hidden>
                <div class="profile-icon big" style="background:${color}"></div>
                <div class="pm-name"></div>
                <div class="pm-email"></div>
                <a href="my-bookings.html" class="logout-btn" style="display:block;margin-bottom:8px;text-decoration:none;line-height:1.9">🎟️ My Bookings</a>
                <a href="account.html" class="logout-btn" style="display:block;margin-bottom:8px;text-decoration:none;line-height:1.9">My Account</a>
                <button class="logout-btn" id="logoutBtn">Logout</button>
            </div>
        </div>`;

    authButtons.querySelectorAll(".profile-icon").forEach(el => (el.textContent = initial));
    authButtons.querySelector(".pm-name").textContent = name;
    authButtons.querySelector(".pm-email").textContent = user.email || "";

    const menu = document.getElementById("profileMenu");
    document.getElementById("profileBtn").addEventListener("click", (e) => {
        e.stopPropagation();
        menu.hidden = !menu.hidden;
    });
    document.addEventListener("click", (e) => {
        if (!menu.contains(e.target)) menu.hidden = true;
    });
    document.getElementById("logoutBtn").addEventListener("click", async () => {
        await signOut(auth);
        window.location.reload();
    });
}

// hide Login/Sign Up for a moment so they don't flash before the icon appears
if (authButtons) {
    authButtons.style.visibility = "hidden";
    const reveal = () => (authButtons.style.visibility = "visible");
    setTimeout(reveal, 2500);

    onAuthStateChanged(auth, (user) => {
        console.log("[navbar-auth] auth state:", user ? user.email : "signed out");
        try {
            if (user) showProfile(user);
        } finally {
            reveal();
        }
    });
}