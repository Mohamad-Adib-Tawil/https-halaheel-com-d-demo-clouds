(() => {
  const config = window.INVITE_CONFIG;
  const $ = (id) => document.getElementById(id);
  const arabicDigits = new Intl.NumberFormat("ar").format;

  function fillPrayer() {
    const list = $("prayerList");
    config.prayers.forEach((item) => {
      const card = document.createElement("article");
      card.className = "prayer-card";
      const text = document.createElement("p");
      text.textContent = item.text;
      const reference = document.createElement("a");
      reference.textContent = item.reference;
      reference.href = item.url;
      reference.target = "_blank";
      reference.rel = "noopener";
      card.append(text, reference);
      list.append(card);
    });
    const shareImage = new URL(config.assets.shareImage, document.baseURI).href;
    document.querySelectorAll('meta[property="og:image"], meta[name="twitter:image"]').forEach((meta) => meta.setAttribute("content", shareImage));
    const hadithText = $("hadithText");
    const hadithSource = $("hadithSource");
    if (hadithText) hadithText.textContent = config.hadith.text;
    if (hadithSource) {
      hadithSource.textContent = config.hadith.source;
      hadithSource.href = config.hadith.url;
    }
  }

  function fillCalendar() {
    const event = config.reception;
    const date = new Date(event.date);
    const weekday = new Intl.DateTimeFormat("ar", { weekday: "long", timeZone: event.timeZone }).format(date);
    const month = new Intl.DateTimeFormat("ar", { month: "long", year: "numeric", timeZone: event.timeZone }).format(date);
    $("calendarMonth").textContent = month;
    $("calendarDay").textContent = arabicDigits(new Intl.DateTimeFormat("en", { day: "numeric", timeZone: event.timeZone }).format(date));
    $("calendarWeekday").textContent = weekday;
    $("calendarTime").textContent = event.timeText;

    const end = new Date(date.getTime() + 4 * 60 * 60 * 1000);
    const localStamp = (value) => {
      const parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: event.timeZone, year: "numeric", month: "2-digit", day: "2-digit",
        hour: "2-digit", minute: "2-digit", hourCycle: "h23"
      }).formatToParts(value).reduce((result, part) => {
        if (part.type !== "literal") result[part.type] = part.value;
        return result;
      }, {});
      return `${parts.year}${parts.month}${parts.day}T${parts.hour}${parts.minute}`;
    };
    const startStamp = localStamp(date);
    const endStamp = localStamp(end);
    const title = `بشارة مولود ${config.baby.nameArabic}`;
    const details = config.copy.invitation;
    const location = `${event.venueName} — ${event.venueAddress}`;
    const google = new URL("https://calendar.google.com/calendar/render");
    google.search = new URLSearchParams({ action: "TEMPLATE", text: title, dates: `${startStamp}/${endStamp}`, ctz: event.timeZone, details, location }).toString();
    $("googleCalendar").href = google.toString();

    const icsDate = (value) => value.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    const ics = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Nour Aldeen Invitation//AR", "CALSCALE:GREGORIAN",
      "BEGIN:VEVENT", `UID:nour-aldeen-${config.baby.birthDate}@invitation`, `DTSTAMP:${icsDate(new Date())}`,
      `DTSTART:${icsDate(date)}`, `DTEND:${icsDate(end)}`, `SUMMARY:${title}`, `LOCATION:${location}`,
      `DESCRIPTION:${details}`, "END:VEVENT", "END:VCALENDAR"
    ].join("\r\n");
    $("downloadCalendar").href = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
  }

  function safeWish(name, message, color) {
    const card = document.createElement("article");
    card.className = "wish";
    const avatar = document.createElement("span");
    avatar.className = "wish-av";
    avatar.style.background = color || "#7bb89a";
    avatar.textContent = name.trim().charAt(0) || "♥";
    const body = document.createElement("div");
    body.className = "wish-body";
    const byline = document.createElement("div");
    byline.className = "wish-name";
    byline.textContent = name;
    const text = document.createElement("div");
    text.className = "wish-msg";
    text.textContent = message;
    body.append(byline, text);
    card.append(avatar, body);
    return card;
  }

  function setupGuestbook() {
    const list = $("wishList");
    config.guestbook.forEach((wish) => list.append(safeWish(wish.name, wish.message, wish.color)));
    let saved = [];
    try { saved = JSON.parse(localStorage.getItem("nour-invitation-wishes") || "[]"); } catch { saved = []; }
    saved.forEach((wish) => list.prepend(safeWish(wish.name, wish.message, wish.color)));
  }

  function setupRsvp() {
    let attendance = "نعم";
    let companions = 0;
    const companionCount = $("companions");
    const pills = [...document.querySelectorAll("#attendancePills .pill")];
    pills.forEach((button) => button.addEventListener("click", () => {
      attendance = button.dataset.value;
      pills.forEach((pill) => {
        const selected = pill === button;
        pill.classList.toggle("is-selected", selected);
        pill.setAttribute("aria-pressed", String(selected));
      });
    }));
    $("minusGuests").addEventListener("click", () => {
      companions = Math.max(0, companions - 1);
      companionCount.textContent = arabicDigits(companions);
    });
    $("plusGuests").addEventListener("click", () => {
      companions = Math.min(49, companions + 1);
      companionCount.textContent = arabicDigits(companions);
    });
    $("rsvpForm").addEventListener("submit", (event) => {
      event.preventDefault();
      const name = $("guestName").value.trim();
      const message = $("guestMessage").value.trim();
      const response = { name, attendance, guests: attendance === "نعم" ? companions + 1 : 0, message, createdAt: new Date().toISOString() };
      try {
        const responses = JSON.parse(localStorage.getItem("nour-invitation-rsvps") || "[]");
        responses.push(response);
        localStorage.setItem("nour-invitation-rsvps", JSON.stringify(responses));
        if (message) {
          const wishes = JSON.parse(localStorage.getItem("nour-invitation-wishes") || "[]");
          const wish = { name, message, color: "#7bb89a" };
          wishes.unshift(wish);
          localStorage.setItem("nour-invitation-wishes", JSON.stringify(wishes));
          $("wishList").prepend(safeWish(name, message, wish.color));
        }
      } catch {
        $("formStatus").textContent = "تعذّر حفظ الرد على هذا الجهاز.";
        return;
      }
      if (config.contact.whatsappUrl) {
        const body = `تأكيد حضور بشارة ${config.baby.nameArabic}%0Aالاسم: ${encodeURIComponent(name)}%0Aالحضور: ${encodeURIComponent(attendance)}%0Aعدد الحضور: ${response.guests}${message ? `%0Aالتهنئة: ${encodeURIComponent(message)}` : ""}`;
        const destination = new URL(config.contact.whatsappUrl);
        destination.searchParams.set("text", decodeURIComponent(body));
        window.open(destination.toString(), "_blank", "noopener");
        $("formStatus").textContent = "تم تجهيز رسالة التأكيد في واتساب.";
      } else {
        $("formStatus").textContent = "شكراً لتأكيدكم، حُفظ الرد على هذا الجهاز.";
      }
      $("rsvpForm").reset();
      attendance = "نعم";
      companions = 0;
      companionCount.textContent = "٠";
      pills.forEach((pill, index) => {
        pill.classList.toggle("is-selected", index === 0);
        pill.setAttribute("aria-pressed", String(index === 0));
      });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    fillPrayer();
    fillCalendar();
    setupGuestbook();
    setupRsvp();
  });
})();
