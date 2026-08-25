/* =====================================================================
   Glitter Bar — main.js
   1. Business config (edit here)  2. Contact links  3. Nav
   4. Hero sparkles  5. Scroll reveal  6. Image slots & placeholders
   7. Editorial list hover previews  8. Gallery (auto-detects images)
   ===================================================================== */

/* ---------- 1. Business config — tek yerden düzenleyin ---------- */
const CONFIG = {
  whatsapp: "905535706175",          // ülke koduyla, boşluksuz
  phoneLabel: "0553 570 6175",       // görünen numara
  phone2: "905521421682",
  phone2Label: "0552 142 16 82",
  instagram: "mugla.glitter.bar",    // @ olmadan
  waMessage: "Merhaba, Muğla Glitter Bar için rezervasyon yapmak istiyorum.",
  galleryMax: 40,                    // /images/gallery-1.jpg … gallery-N.jpg taranır
};

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isTouch = window.matchMedia("(hover: none)").matches;
const isCompact = window.matchMedia("(max-width: 1024px)").matches; // list thumbs instead of hover preview

/* ---------- 2. Contact links ---------- */
const waUrl = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(CONFIG.waMessage)}`;
document.querySelectorAll("[data-wa]").forEach((a) => {
  a.href = waUrl; a.target = "_blank"; a.rel = "noopener";
});
document.querySelectorAll("[data-tel]").forEach((a) => {
  a.href = `tel:+${CONFIG.whatsapp}`;
  if (a.hasAttribute("data-tel-label")) a.textContent = CONFIG.phoneLabel;
});
document.querySelectorAll("[data-tel2]").forEach((a) => {
  a.href = `tel:+${CONFIG.phone2}`; a.textContent = CONFIG.phone2Label;
});
document.querySelectorAll("[data-ig]").forEach((a) => {
  a.href = `https://instagram.com/${CONFIG.instagram}`; a.target = "_blank"; a.rel = "noopener";
  if (a.hasAttribute("data-ig-label")) a.textContent = `@${CONFIG.instagram}`;
});

/* ---------- 3. Nav ---------- */
const nav = document.getElementById("nav");
const toggle = document.getElementById("navToggle");
const menu = document.getElementById("mobileMenu");
const mobileCta = document.querySelector(".mobile-cta");

const onScroll = () => {
  nav.classList.toggle("is-scrolled", window.scrollY > 40);
  if (mobileCta) mobileCta.classList.toggle("is-visible", window.scrollY > window.innerHeight * 0.6);
};
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

const setMenu = (open) => {
  toggle.setAttribute("aria-expanded", String(open));
  toggle.setAttribute("aria-label", open ? "Menüyü kapat" : "Menüyü aç");
  menu.hidden = !open;
  document.body.style.overflow = open ? "hidden" : "";
};
toggle.addEventListener("click", () => setMenu(menu.hidden));
menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
window.addEventListener("keydown", (e) => { if (e.key === "Escape" && !menu.hidden) setMenu(false); });

/* ---------- 4. Hero sparkles (sparse, slow) ---------- */
const canvas = document.getElementById("sparkles");
if (canvas && !reduceMotion) {
  const ctx = canvas.getContext("2d");
  let w, h, dpr, stars = [];
  const COLORS = ["255,235,205", "232,196,203", "201,163,83", "255,255,255"];

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.round((w * h) / 16000);
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      r: 0.6 + Math.random() * 1.6,
      c: COLORS[(Math.random() * COLORS.length) | 0],
      t: Math.random() * Math.PI * 2,
      s: 0.004 + Math.random() * 0.01,
      vy: -(0.03 + Math.random() * 0.08),
      big: Math.random() < 0.12,
    }));
  };

  const drawStar = (x, y, r, a, c) => {
    ctx.strokeStyle = `rgba(${c},${a})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x - r * 3, y); ctx.lineTo(x + r * 3, y);
    ctx.moveTo(x, y - r * 3); ctx.lineTo(x, y + r * 3);
    ctx.stroke();
  };

  let running = true;
  const frame = () => {
    if (!running) return;
    ctx.clearRect(0, 0, w, h);
    for (const s of stars) {
      s.t += s.s; s.y += s.vy;
      if (s.y < -10) { s.y = h + 10; s.x = Math.random() * w; }
      const a = (Math.sin(s.t) + 1) / 2 * 0.85;
      ctx.fillStyle = `rgba(${s.c},${a})`;
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
      if (s.big && a > 0.55) drawStar(s.x, s.y, s.r, (a - 0.55) * 1.5, s.c);
    }
    requestAnimationFrame(frame);
  };

  resize();
  window.addEventListener("resize", resize);
  new IntersectionObserver(([e]) => {
    running = e.isIntersecting;
    if (running) requestAnimationFrame(frame);
  }).observe(canvas);
}

/* ---------- 5. Scroll reveal ---------- */
const revealIO = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("in"); revealIO.unobserve(e.target); }
  });
}, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
document.querySelectorAll(".reveal").forEach((el, i) => {
  el.style.setProperty("--i", el.parentElement?.classList.contains("list") ? [...el.parentElement.children].indexOf(el) : 0);
  revealIO.observe(el);
});

/* ---------- 6. Image slots: fall back to designed placeholder ---------- */
const LABELS = { hero: "Fotoğraf: açılış", about: "Fotoğraf: bar masası" };
document.querySelectorAll("img[data-slot]").forEach((img) => {
  const box = img.parentElement;
  const fail = () => { box.classList.add("is-placeholder"); box.dataset.label = LABELS[img.dataset.slot] || "Fotoğraf"; };
  img.addEventListener("error", fail);
  if (img.complete && img.naturalWidth === 0) fail();
});

/* ---------- 7. Editorial lists: floating preview on hover (desktop), thumb on mobile ---------- */
const probe = (src) => new Promise((res) => {
  const i = new Image();
  i.onload = () => res(true); i.onerror = () => res(false);
  i.src = src;
});

const setupList = (listId, previewId) => {
  const list = document.getElementById(listId);
  const preview = document.getElementById(previewId);
  if (!list || !preview) return;
  const rows = [...list.querySelectorAll(".list__row")];
  const pimg = preview.querySelector("img");

  rows.forEach(async (row) => {
    const ok = await probe(row.dataset.img);
    row.dataset.hasImg = ok ? "1" : "0";
    if (ok && (isTouch || isCompact)) {
      const t = document.createElement("img");
      t.className = "list__thumb"; t.src = row.dataset.img; t.alt = ""; t.loading = "lazy";
      row.prepend(t); row.classList.add("has-thumb");
    }
  });

  if (isTouch || isCompact) return;

  let raf = 0, my = 0;
  // anchor to the list's right edge (empty column), follow the cursor vertically only
  const move = () => {
    const x = list.getBoundingClientRect().right - preview.offsetWidth;
    const y = Math.max(90, Math.min(my - preview.offsetHeight / 2, window.innerHeight - preview.offsetHeight - 16));
    preview.style.transform = `translate(${x}px, ${y}px)`; raf = 0;
  };

  rows.forEach((row) => {
    row.addEventListener("mouseenter", () => {
      rows.forEach((r) => r.classList.remove("is-active"));
      row.classList.add("is-active");
      if (row.dataset.hasImg === "1") { pimg.src = row.dataset.img; preview.classList.remove("is-placeholder"); }
      else { preview.classList.add("is-placeholder"); preview.dataset.label = row.querySelector("h3").textContent; }
      preview.classList.add("is-visible");
    });
    row.addEventListener("mouseleave", () => { row.classList.remove("is-active"); preview.classList.remove("is-visible"); });
  });
  list.addEventListener("mousemove", (e) => {
    my = e.clientY;
    if (!raf) raf = requestAnimationFrame(move);
  });
};
setupList("serviceList", "servicePreview");
setupList("eventList", "eventPreview");

/* ---------- 8. Gallery: loads /images/gallery-1..N.jpg, stops at first missing ---------- */
(async () => {
  const grid = document.getElementById("galleryGrid");
  if (!grid) return;
  const found = [];
  for (let n = 1; n <= CONFIG.galleryMax; n++) {
    const src = `/images/gallery-${n}.jpg`;
    if (await probe(src)) found.push(src); else break;
  }
  const count = found.length || 6; // placeholder tiles until photos arrive
  for (let i = 0; i < count; i++) {
    const item = document.createElement("figure");
    item.className = "gallery__item reveal";
    if (found[i]) {
      const img = document.createElement("img");
      img.src = found[i]; img.alt = `Glitter Bar etkinlik fotoğrafı ${i + 1}`; img.loading = "lazy";
      item.appendChild(img);
    } else {
      item.classList.add("is-placeholder");
      item.dataset.label = `Fotoğraf ${i + 1}`;
      item.appendChild(document.createElement("img"));
    }
    item.style.transitionDelay = `${(i % 6) * 60}ms`;
    grid.appendChild(item);
    revealIO.observe(item);
  }
})();
