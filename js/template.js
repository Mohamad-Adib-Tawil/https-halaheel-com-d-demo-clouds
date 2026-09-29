/* ============================================================
   قالب footprints — الإعدادات والتفاعل (بشارة مولود جديد)
   أجواء حضانة ناعمة: نعناع/خوخ/وردي، قدمان صغيرتان، قلوب، شريط
   عدّل بيانات البشارة من js/config.js.
   ============================================================ */

const WEDDING_CONFIG = window.INVITE_CONFIG;

/* ---------------- أرقام عربية-هندية ---------------- */
const AR_DIGITS = ["٠","١","٢","٣","٤","٥","٦","٧","٨","٩"];
function toAr(s) { return String(s).replace(/[0-9]/g, (d) => AR_DIGITS[+d]); }

/* ---------------- تعبئة المحتوى ---------------- */
function fillContent() {
  const c = WEDDING_CONFIG;
  const babyName = c.baby.nameArabic;   // مولود: الاسم من celebrant/babyName فقط — لا groom الزفافي

  setText("celebrantName", babyName || null);

  // صورة المولود في الترويسة — تظهر فقط عند تحميل صورة بنجاح
  const _imgs = c.assets || {};
  const _src = _imgs.babyPhoto;
  const _box = document.getElementById('heroPhoto');
  const _im = document.getElementById('heroPhotoImg');
  if (_box && _im && _src) {
    _im.onload = function () { _box.classList.add('is-shown'); };
    _im.onerror = function () { _box.classList.remove('is-shown'); };
    _im.src = _src;
  }

  // صورة القاعة من الزبون — تفتح المكان وتحلّ محلّ الرسمة عند نجاح التحميل فقط
  const _venueSrc = _imgs.venuePhoto;
  const _venueBox = document.getElementById('venuePhoto');
  if (_venueBox && _venueSrc) {
    const _vp = new Image();
    _vp.onload = function () {
      _venueBox.style.backgroundImage = 'url("' + _venueSrc + '")';
      _venueBox.classList.add('has-img');
      const _venueArt = document.querySelector('.venue .venue__art');
      if (_venueArt) _venueArt.style.display = 'none';
    };
    _vp.src = _venueSrc;
  }

  // صورة خلفية اختيارية بحواف ناعمة — تظهر فقط عند تحميلها بنجاح
  const _bg = _imgs.background;
  ['coverBg', 'heroBg'].forEach(function (id) {
    const el = document.getElementById(id);
    if (el && _bg) {
      const p = new Image();
      p.onload = function () { el.style.backgroundImage = 'url("' + _bg + '")'; el.classList.add('is-shown'); };
      p.onerror = function () { el.classList.remove('is-shown'); };
      p.src = _bg;
    }
  });

  setText("heroKicker", c.copy.heroSubtitle || "بشرى سارة");
  setText("englishName", c.baby.nameEnglish);
  setText("heroGreet", `أهلاً بـ ${babyName}`);
  setText("heroVerse", c.copy.welcome || "");
  setText("heroDate", `تاريخ الميلاد: ${c.baby.birthDateText}`);
  setText("invitationText", c.copy.invitation);
  setText("venueDate", c.reception.dateText);
  setText("venueTime", c.reception.timeText);
  setText("venueName", c.reception.venueName);
  setText("venueAddr", c.reception.venueAddress);
  setText("closingNote", c.copy.closing);
  setText("closingHashtag", c.copy.hashtag);
  setText("closingHost", c.copy.parentsLine || "");

  // الوزن — يظهر فقط إن وُجد
  const weightWrap = document.getElementById("weightWrap");
  if (weightWrap) {
    if (c.baby.weight != null && String(c.baby.weight).trim() !== "") {
      setText("weightNum", toAr(c.baby.weight));
      weightWrap.hidden = false;
    } else {
      weightWrap.hidden = true;
    }
  }

  const mapBtn = document.getElementById("mapBtn");
  if (mapBtn && c.reception.mapUrl) mapBtn.href = c.reception.mapUrl;
  else if (mapBtn) mapBtn.style.display = "none";

  const mono = document.getElementById("coverMono");
  if (mono && babyName) mono.textContent = `أهلاً بـ ${babyName}`;

  buildTimeline(c.copy.program);
  buildNotes(c.copy.notes);
  buildContact(c);
  applyGender(c.gender);

  if (babyName) document.title = `بشارة مولود — ${babyName}`;
}

/* ---------------- لمسة لون حسب جنس المولود ---------------- */
/* الافتراضي (بدون جنس) = لوحة محايدة جميلة (نعناع/خوخ).
   girl → ميل نحو الوردي الناعم، boy → ميل نحو الأزرق الناعم. */
function applyGender(gender) {
  const root = document.body;
  if (!root) return;
  root.classList.remove("g-girl", "g-boy");
  if (gender === "girl") root.classList.add("g-girl");
  else if (gender === "boy") root.classList.add("g-boy");
}

function setText(id, value) { const el = document.getElementById(id); if (el && value != null) el.textContent = value; }

function buildTimeline(items) {
  const ul = document.getElementById("timeline");
  if (!ul || !Array.isArray(items)) return;
  ul.innerHTML = "";
  items.forEach((it) => {
    const li = document.createElement("li");
    li.className = "timeline__item";
    li.innerHTML = `<span class="timeline__dot" aria-hidden="true"></span>
      <span class="timeline__time">${it.time}</span>
      <span class="timeline__title">${it.title}</span>`;
    ul.appendChild(li);
  });
}

function buildNotes(items) {
  const ul = document.getElementById("notesList");
  if (!ul || !Array.isArray(items)) return;
  ul.innerHTML = "";
  const marks = ["🍼", "🤍", "🧸", "🎀", "✨"];
  items.forEach((txt, i) => {
    const li = document.createElement("li");
    li.className = "notes__item";
    li.innerHTML = `<span class="notes__mark" aria-hidden="true">${marks[i % marks.length]}</span><span>${txt}</span>`;
    ul.appendChild(li);
  });
  /* قسم بلا تنويهات لا يُترك بعنوانه — والملاحظة البارزة المحقونة تُنقل خارجه قبل إخفائه */
  if (!ul.children.length) {
    const sec = ul.closest(".notes");
    if (sec) {
      const note = sec.querySelector("#da3wa-note");
      if (note && sec.parentNode) sec.parentNode.insertBefore(note, sec);
      sec.style.display = "none";
    }
  }
}

function buildContact(c) {
  const link = document.getElementById("contactLink");
  const label = document.querySelector(".contact__label");
  if (!link) return;
  if (label && c.contact.label) label.textContent = c.contact.label;
  if (c.contact.whatsappUrl) {
    link.href = c.contact.whatsappUrl;
    link.target = "_blank";
    link.rel = "noopener";
    link.textContent = c.contact.displayName || "تواصل عبر واتساب";
  } else {
    const box = document.getElementById("contactBox");
    if (box) box.style.display = "none";
  }
}

/* ---------------- قلوب وقدمان تتصاعد على الغلاف ---------------- */
function buildCoverHearts(count) {
  if (reduced()) return;
  const layer = document.getElementById("coverHearts");
  if (!layer) return;
  const glyphs = ["🍼", "🤍", "🩷", "💙", "🧸", "🎀", "⭐"];
  for (let i = 0; i < count; i++) {
    const s = document.createElement("span");
    s.textContent = glyphs[i % glyphs.length];
    s.style.left = Math.random() * 100 + "%";
    s.style.fontSize = (12 + Math.random() * 14) + "px";
    s.style.animationDuration = (6 + Math.random() * 6) + "s";
    s.style.animationDelay = (Math.random() * 6) + "s";
    layer.appendChild(s);
  }
}

/* ---------------- فتح الغلاف: القلب يخفق ثم تنكشف البشارة ---------------- */
function setupCover() {
  const cover = document.getElementById("cover");
  const invite = document.getElementById("invite");
  const btn = document.getElementById("openBtn");
  const baby = document.querySelector(".babySvg");
  if (!cover || !btn || !invite) return;
  btn.addEventListener("click", () => {
    if (baby) baby.classList.add("is-pop");
    const popDur = reduced() ? 0 : 900;
    setTimeout(() => {
      cover.classList.add("is-open");
      invite.setAttribute("aria-hidden", "false");
      revealFirst();
      startFloaties(30);
    }, popDur);
    setTimeout(() => { cover.style.display = "none"; }, popDur + 1100);
  }, { once: true });
}

/* ---------------- ظهور الأقسام ---------------- */
function setupReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) { items.forEach((el) => el.classList.add("is-visible")); return; }
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add("is-visible"); obs.unobserve(entry.target); }
    });
  }, { threshold: 0.12 });
  items.forEach((el) => obs.observe(el));
}
function revealFirst() { document.querySelectorAll(".hero.reveal").forEach((el) => el.classList.add("is-visible")); }

/* ---------------- العدّاد التنازلي ---------------- */
function setupCountdown() {
  const target = new Date(WEDDING_CONFIG.reception.date).getTime();
  if (isNaN(target)) return;
  const els = {
    days: document.getElementById("cdDays"), hours: document.getElementById("cdHours"),
    mins: document.getElementById("cdMins"), secs: document.getElementById("cdSecs"),
  };
  const cd = document.getElementById("countdown");
  const arrived = document.getElementById("cdArrived");
  function tick() {
    const diff = target - Date.now();
    if (diff <= 0) { if (cd) cd.hidden = true; if (arrived) arrived.hidden = false; clearInterval(timer); return; }
    if (els.days) els.days.textContent = pad(Math.floor(diff / 86400000));
    if (els.hours) els.hours.textContent = pad(Math.floor((diff % 86400000) / 3600000));
    if (els.mins) els.mins.textContent = pad(Math.floor((diff % 3600000) / 60000));
    if (els.secs) els.secs.textContent = pad(Math.floor((diff % 60000) / 1000));
  }
  const timer = setInterval(tick, 1000);
  tick();
}
function pad(n) { return toAr(String(n).padStart(2, "0")); }
function reduced() { return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches; }

/* ---------------- قلوب وقدمان تطفو عند الفتح ---------------- */
function startFloaties(count) {
  if (reduced()) return;
  const layer = document.getElementById("floaties");
  if (!layer) return;
  const glyphs = ["🍼", "🤍", "🩷", "💙", "🧸", "🎀", "⭐"];
  for (let i = 0; i < count; i++) {
    const s = document.createElement("span");
    s.className = "floaty";
    s.textContent = glyphs[i % glyphs.length];
    s.style.left = Math.random() * 100 + "%";
    s.style.fontSize = (14 + Math.random() * 16) + "px";
    s.style.animationDuration = (6 + Math.random() * 6) + "s";
    s.style.animationDelay = (Math.random() * 4) + "s";
    layer.appendChild(s);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  fillContent();
  buildCoverHearts(22);
  setupCover();
  setupReveal();
  setupCountdown();
});
