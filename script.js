const API = "http://localhost:5000";

// ── NAVBAR: Login/Logout toggle ──
function updateNavbar() {
  const token = localStorage.getItem("token");
  const name  = localStorage.getItem("userName");
  const loginLink = document.querySelector('nav a[href="login.html"]');
  if (loginLink) {
    if (token) {
      loginLink.textContent = name ? name.split(" ")[0] : "Profile";
      loginLink.href = "profile.html";
    } else {
      loginLink.textContent = "Login";
      loginLink.href = "login.html";
    }
  }
}

// ── PACKAGES: Backend se load karo, fallback static ──
const STATIC_PACKAGES = [
  { _id: "goa",    name: "Goa Tour",            duration: "3 Days / 2 Nights", price: 7999,  image: "images/goa.jpg",    emoji: "🌴" },
  { _id: "manali", name: "Manali Trip",          duration: "5 Days / 4 Nights", price: 12999, image: "images/manali.jpg", emoji: "🏔" },
  { _id: "bali",   name: "Bali (International)", duration: "6 Days / 5 Nights", price: 49999, image: "",                  emoji: "🏝" },
  { _id: "dubai",  name: "Dubai Tour",           duration: "5 Days / 4 Nights", price: 39999, image: "",                  emoji: "🏜" },
];

async function loadPackages() {
  const container = document.getElementById("homePackages");
  if (!container) return;

  container.innerHTML = "<p style='color:#94a3b8'>Loading...</p>";

  let packages = STATIC_PACKAGES;

  try {
    const res = await fetch(`${API}/api/packages`);
    if (res.ok) packages = await res.json();
  } catch {}

  container.innerHTML = "";
  packages.forEach(p => {
    container.innerHTML += `
      <div class="item">
        ${p.image ? `<img src="${p.image}" onerror="this.style.display='none'">` : ""}
        <h3>${p.emoji || "🌍"} ${p.name}</h3>
        <p>${p.duration || "N/A"}</p>
        <p style="color:#ffb703;font-weight:600;font-size:18px">₹${Number(p.price).toLocaleString("en-IN")}</p>
        <button class="btn" onclick="bookNow('${p._id}','${p.name}',${p.price})" style="margin-top:10px;width:100%;padding:10px;border:none;background:#ffb703;color:#0f172a;border-radius:8px;font-weight:600;cursor:pointer">
          Book Now
        </button>
      </div>`;
  });
}

// ── BOOK NOW ──
function bookNow(id, name, price) {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Pehle login karein!");
    window.location.href = "login.html";
    return;
  }
  window.location.href = `payment.html?id=${id}&name=${encodeURIComponent(name)}&price=${price}`;
}

// ── PAGE LOAD ──
window.onload = function() {
  updateNavbar();
  loadPackages();
};
