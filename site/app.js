// /**
//  * Smart Citizen — site → Telegram bot helper
//  * Полный рабочий main.js
//  *
//  * ВАЖНО: username бота (без @)
//  * Ваш бот: @aqyldy_qala_bot
//  */
// const BOT_USERNAME = "aqyldy_qala_bot";
// const START_PARAM = "from_site";

// const BOT_LINK = `https://t.me/${BOT_USERNAME}?start=${encodeURIComponent(START_PARAM)}`;

// // Если вдруг username не заменили
// const SAFE_BOT_LINK = BOT_USERNAME === "YOUR_BOT_USERNAME" ? "https://t.me/" : BOT_LINK;

// // ----------------- helpers -----------------
// function el(id) { return document.getElementById(id); }

// function isMobileLike() {
//   return matchMedia("(pointer:coarse)").matches;
// }

// // безопасно открыть ссылку (меньше блокировок)
// function openLink(url) {
//   // лучше location.href (особенно на мобилках), чем window.open
//   window.location.href = url;
// }

// async function copyToClipboard(text) {
//   try {
//     if (navigator.clipboard && window.isSecureContext) {
//       await navigator.clipboard.writeText(text);
//       return true;
//     }
//   } catch {}
//   // fallback: старый способ
//   try {
//     const ta = document.createElement("textarea");
//     ta.value = text;
//     ta.style.position = "fixed";
//     ta.style.left = "-9999px";
//     ta.style.top = "-9999px";
//     document.body.appendChild(ta);
//     ta.focus();
//     ta.select();
//     const ok = document.execCommand("copy");
//     document.body.removeChild(ta);
//     return ok;
//   } catch {
//     return false;
//   }
// }
// function initAuthUI() {
//   const registerBtnDesktop = el("registerBtnDesktop");
//   const loginBtnDesktop = el("loginBtnDesktop");
//   const logoutBtnDesktop = el("logoutBtnDesktop");

//   const registerBtnMobile = el("registerBtnMobile");
//   const loginBtnMobile = el("loginBtnMobile");
//   const logoutBtnMobile = el("logoutBtnMobile");

//   const hasSession =
//     localStorage.getItem("aq.session.v1") === "true" ||
//     localStorage.getItem("aq_session") === "true";

//   const hasUser =
//     !!localStorage.getItem("aq_current_user") ||
//     !!localStorage.getItem("aq_user");

//   const isLoggedIn = hasSession && hasUser;

//   function show(elm) {
//     if (elm) elm.style.display = "";
//   }

//   function hide(elm) {
//     if (elm) elm.style.display = "none";
//   }

//   function logout() {
//     localStorage.removeItem("aq.session.v1");
//     localStorage.removeItem("aq_session");
//     localStorage.removeItem("aq_current_user");
//     window.location.href = "index.html";
//   }

//   if (isLoggedIn) {
//     hide(registerBtnDesktop);
//     hide(loginBtnDesktop);
//     show(logoutBtnDesktop);

//     hide(registerBtnMobile);
//     hide(loginBtnMobile);
//     show(logoutBtnMobile);
//   } else {
//     show(registerBtnDesktop);
//     show(loginBtnDesktop);
//     hide(logoutBtnDesktop);

//     show(registerBtnMobile);
//     show(loginBtnMobile);
//     hide(logoutBtnMobile);
//   }

//   if (logoutBtnDesktop) {
//     logoutBtnDesktop.addEventListener("click", logout);
//   }

//   if (logoutBtnMobile) {
//     logoutBtnMobile.addEventListener("click", (e) => {
//       e.preventDefault();
//       logout();
//     });
//   }
// }
// // ----------------- bind common bot links -----------------
// function bindBotLinks() {
//   const ids = ["openBotTop","openBotHero","openBotCta","openBotFooter","openBotMobile","openBotMap","openBotInline"];
//   ids.forEach((id) => {
//     const a = el(id);
//     if (a) a.setAttribute("href", SAFE_BOT_LINK);
//   });

//   const botLinkText = el("botLinkText");
//   if (botLinkText) botLinkText.textContent = SAFE_BOT_LINK;
// }

// // ----------------- FAQ -----------------
// function initFAQ() {
//   const faqItems = document.querySelectorAll(".faqItem");
//   faqItems.forEach((item) => {
//     const btn = item.querySelector(".faqBtn");
//     if (!btn) return;
//     btn.addEventListener("click", () => {
//       const isOpen = item.classList.contains("open");
//       faqItems.forEach((i) => i.classList.remove("open"));
//       if (!isOpen) item.classList.add("open");
//     });
//   });
// }

// // ----------------- mobile menu -----------------
// function initMobileMenu() {
//   const burger = el("burger");
//   const menu = el("mobileMenu");
//   if (!burger || !menu) return;

//   burger.addEventListener("click", () => menu.classList.toggle("open"));
//   menu.querySelectorAll("a").forEach((a) =>
//     a.addEventListener("click", () => menu.classList.remove("open"))
//   );
// }

// // ----------------- smooth scroll -----------------
// function initSmoothScroll() {
//   document.querySelectorAll('a[href^="#"]').forEach((a) => {
//     a.addEventListener("click", (e) => {
//       const href = a.getAttribute("href");
//       if (!href || href === "#") return;
//       const target = document.querySelector(href);
//       if (!target) return;
//       e.preventDefault();
//       target.scrollIntoView({ behavior: "smooth", block: "start" });
//     });
//   });
// }

// // ----------------- QR (real image) -----------------
// function renderQR() {
//   const qrBox = el("qrBox");
//   if (!qrBox) return;

//   const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(SAFE_BOT_LINK)}`;

//   const img = new Image();
//   img.alt = "QR";
//   img.style.cssText = "width:140px;height:140px;border-radius:16px";
//   img.onload = () => { qrBox.innerHTML = ""; qrBox.appendChild(img); };
//   img.onerror = () => { qrBox.innerHTML = `QR недоступен<br><span class="qrSub">Скопируйте ссылку ниже</span>`; };
//   img.src = qrUrl;
// }

// // ----------------- state -----------------
// const state = {
//   category: "Освещение",
//   city: "Петропавловск",
//   desc: "",
//   lat: null,
//   lng: null,
//   photoFile: null,
// };

// function syncOutput() {
//   const outCategory = el("outCategory");
//   const outCity = el("outCity");
//   const outCoords = el("outCoords");

//   if (outCategory) outCategory.textContent = state.category || "—";
//   if (outCity) outCity.textContent = state.city || "—";

//   if (outCoords) {
//     if (state.lat != null && state.lng != null) {
//       outCoords.textContent = `${state.lat.toFixed(6)}, ${state.lng.toFixed(6)}`;
//     } else {
//       outCoords.textContent = "—";
//     }
//   }

//   const latInput = el("latInput");
//   const lngInput = el("lngInput");
//   if (latInput) latInput.value = state.lat != null ? state.lat.toFixed(6) : "";
//   if (lngInput) lngInput.value = state.lng != null ? state.lng.toFixed(6) : "";
// }

// function buildDraftText() {
//   const coordsText =
//     state.lat != null && state.lng != null
//       ? `${state.lat.toFixed(6)}, ${state.lng.toFixed(6)}`
//       : "точка не выбрана";

//   const osmLink =
//     state.lat != null && state.lng != null
//       ? `https://www.openstreetmap.org/?mlat=${state.lat.toFixed(6)}&mlon=${state.lng.toFixed(6)}#map=18/${state.lat.toFixed(6)}/${state.lng.toFixed(6)}`
//       : "—";

//   return `🟦 Aqyldy Qala — обращение
// Категория: ${state.category || "—"}
// Город/район: ${state.city || "—"}
// Координаты: ${coordsText}
// Карта: ${osmLink}

// Описание:
// ${state.desc || "—"}

// 📌 Дальше:
// 1) Прикрепите фото (если есть)
// 2) Отправьте геолокацию точкой в Telegram`;
// }

// /**
//  * Открытие Telegram “как максимально похоже на отправку”
//  * 1) копируем текст
//  * 2) пытаемся открыть бота с подставленным text=
//  * 3) fallback: share/url
//  */
// async function goToTelegramWithDraft(draftText) {
//   // 1) копируем (надежный шаг)
//   const copied = await copyToClipboard(draftText);

//   // 2) пробуем deep link (часто работает на мобилках)
//   // В некоторых клиентах Telegram text= игнорируется — это нормально.
//   const deepLink =
//     `https://t.me/${BOT_USERNAME}?start=${encodeURIComponent(START_PARAM)}&text=${encodeURIComponent(draftText)}`;

//   // 3) fallback share-url (если deepLink не подставит текст)
//   const shareUrl =
//     `https://t.me/share/url?url=${encodeURIComponent(SAFE_BOT_LINK)}&text=${encodeURIComponent(draftText)}`;

//   if (isMobileLike()) {
//     // На мобилке лучше сразу deepLink, он ведёт прямо в чат с ботом
//     openLink(deepLink);

//     // Если пользователь вернулся назад/не сработало — пусть будет запасной вариант:
//     // (Не делаем setTimeout с window.open, чтобы не ловить блокировки)
//     // Можно показать подсказку:
//     if (copied) {
//       // минимально
//       // alert("Текст скопирован. Если он не подставился в Telegram — вставьте вручную и отправьте.");
//     }
//     return;
//   }

//   // Десктоп:
//   // 1) открываем shareUrl в новой вкладке (иногда телеграм-веб)
//   // 2) и сразу открываем бота (одна вкладка)
//   // Но две вкладки могут блокироваться. Поэтому делаем один переход:
//   // открываем бота (надежнее), а текст уже в буфере.
//   if (copied) {
//     alert("Текст обращения скопирован. Сейчас открою бота — вставьте (Ctrl+V) и отправьте.");
//   } else {
//     alert("Сейчас открою бота. Если текст не вставился — скопируйте его с сайта и отправьте.");
//   }
//   openLink(SAFE_BOT_LINK);

//   // Если прям хочешь оставлять shareUrl — можешь вместо SAFE_BOT_LINK открыть shareUrl:
//   // openLink(shareUrl);
// }

// // ----------------- demo form -----------------
// function initDemoForm() {
//   const categorySelect = el("categorySelect");
//   const cityInput = el("cityInput");
//   const descInput = el("descInput");
//   const photoInput = el("photoInput");
//   const photoPreview = el("photoPreview");
//   const resetBtn = el("resetDraft");
//   const openWithDraft = el("openBotWithDraft");
//   const useMyLocationBtn = el("useMyLocation");

//   if (categorySelect) {
//     categorySelect.addEventListener("change", () => {
//       state.category = categorySelect.value;
//       syncOutput();
//     });
//   }

//   if (cityInput) {
//     cityInput.addEventListener("input", () => {
//       state.city = cityInput.value.trim();
//       syncOutput();
//     });
//   }

//   if (descInput) {
//     descInput.addEventListener("input", () => {
//       state.desc = descInput.value.trim();
//     });
//   }

//   if (photoInput && photoPreview) {
//     photoInput.addEventListener("change", () => {
//       const file = photoInput.files && photoInput.files[0];
//       state.photoFile = file || null;

//       if (!file) {
//         photoPreview.innerHTML =
//           `<div class="photoPlaceholder">Нажмите или перетащите фото<br><span class="photoSub">JPG / PNG</span></div>`;
//         return;
//       }

//       const url = URL.createObjectURL(file);
//       photoPreview.innerHTML = `<img src="${url}" alt="Фото проблемы">`;
//     });

//     // drag & drop (Safari-friendly)
//     const drop = photoPreview.closest(".photoDrop");
//     if (drop) {
//       drop.addEventListener("dragover", (e) => { e.preventDefault(); drop.style.opacity = "0.9"; });
//       drop.addEventListener("dragleave", () => { drop.style.opacity = "1"; });
//       drop.addEventListener("drop", (e) => {
//         e.preventDefault();
//         drop.style.opacity = "1";

//         const file = e.dataTransfer.files && e.dataTransfer.files[0];
//         if (!file) return;

//         const dt = new DataTransfer();
//         dt.items.add(file);
//         photoInput.files = dt.files;
//         photoInput.dispatchEvent(new Event("change"));
//       });
//     }
//   }

//   if (useMyLocationBtn) {
//     useMyLocationBtn.addEventListener("click", () => {
//       if (!navigator.geolocation) {
//         alert("Геолокация не поддерживается в вашем браузере.");
//         return;
//       }
//       navigator.geolocation.getCurrentPosition(
//         (pos) => {
//           const { latitude, longitude } = pos.coords;
//           setPoint(latitude, longitude, true);
//         },
//         () => alert("Не удалось получить местоположение. Разрешите доступ к геолокации.")
//       );
//     });
//   }

//   if (resetBtn) {
//     resetBtn.addEventListener("click", () => {
//       state.category = "Освещение";
//       state.city = "Петропавловск";
//       state.desc = "";
//       state.lat = null;
//       state.lng = null;
//       state.photoFile = null;

//       if (categorySelect) categorySelect.value = state.category;
//       if (cityInput) cityInput.value = state.city;
//       if (descInput) descInput.value = "";
//       if (photoInput) photoInput.value = "";
//       if (photoPreview) photoPreview.innerHTML =
//         `<div class="photoPlaceholder">Нажмите или перетащите фото<br><span class="photoSub">JPG / PNG</span></div>`;

//       // reset marker
//       if (marker && map) {
//         map.removeLayer(marker);
//         marker = null;
//       }

//       syncOutput();
//     });
//   }

//   if (openWithDraft) {
//     openWithDraft.addEventListener("click", async (e) => {
//       e.preventDefault();

//       const draftText = buildDraftText();
//       await goToTelegramWithDraft(draftText);
//     });
//   }

//   syncOutput();
// }

// // ----------------- Leaflet map -----------------
// let map = null;
// let marker = null;

// function setPoint(lat, lng, pan = false) {
//   state.lat = lat;
//   state.lng = lng;
//   syncOutput();

//   if (!map) return;

//   if (!marker) {
//     marker = L.marker([lat, lng], { draggable: true }).addTo(map);
//     marker.on("dragend", () => {
//       const p = marker.getLatLng();
//       state.lat = p.lat;
//       state.lng = p.lng;
//       syncOutput();
//     });
//   } else {
//     marker.setLatLng([lat, lng]);
//   }

//   if (pan) map.setView([lat, lng], Math.max(map.getZoom(), 15));
// }

// function initLeafletMap() {
//   const mapEl = el("leafletMap");
//   if (!mapEl || typeof L === "undefined") return;

//   // default: Petropavl
//   const startLat = 54.8726;
//   const startLng = 69.1430;

//   const mobile = isMobileLike();
//   map = L.map("leafletMap", { scrollWheelZoom: !mobile }).setView([startLat, startLng], 12);

//   L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
//     maxZoom: 19,
//     attribution: "&copy; OpenStreetMap",
//   }).addTo(map);

//   map.on("click", (e) => {
//     setPoint(e.latlng.lat, e.latlng.lng, false);
//   });
// }

// // ----------------- init -----------------
// const yearEl = el("year");
// if (yearEl) yearEl.textContent = new Date().getFullYear();

// bindBotLinks();
// initAuthUI();
// initFAQ();
// initMobileMenu();
// renderQR();
// initSmoothScroll();
// initDemoForm();
// window.addEventListener("load", initLeafletMap);




















/**
 * Aqyldy Qala — main app.js
 * Работает для:
 * - index.html
 * - login.html
 * - (опционально) register.html, если там есть нужные id
 */

const BOT_USERNAME = "aqyldy_qala_bot";
const START_PARAM = "from_site";
const BOT_LINK = `https://t.me/${BOT_USERNAME}?start=${encodeURIComponent(START_PARAM)}`;
const SAFE_BOT_LINK = BOT_USERNAME === "YOUR_BOT_USERNAME" ? "https://t.me/" : BOT_LINK;

// storage keys
const USERS_KEY = "aq_users";
const CURRENT_USER_KEY = "aq_current_user";
const SESSION_KEY = "aq.session.v1";
const LEGACY_SESSION_KEY = "aq_session";
const LEGACY_USER_KEY = "aq_user";
const REQUESTS_KEY = "aq_requests";

// ----------------- helpers -----------------
function el(id) {
  return document.getElementById(id);
}

function isMobileLike() {
  return window.matchMedia("(pointer:coarse)").matches;
}

function openLink(url) {
  window.location.href = url;
}

async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {}

  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    ta.style.top = "-9999px";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

function safeJsonParse(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

const SITE_WEBAPP_URL = (window.localStorage.getItem("aq_webapp_url") || "").trim();
const SITE_SHARED_SECRET = (window.localStorage.getItem("aq_webapp_secret") || "").trim();

function normalizeCategoryForSite(description) {
  const text = String(description || "").toLowerCase();
  const has = (...words) => words.some((w) => text.includes(w));

  if (has("яма", "выбои", "асфальт", "дорог", "трещин", "колея", "провал", "бордюр", "тротуар")) {
    return "Roads";
  }
  if (has("фонарь", "свет", "освещ", "ламп", "не горит", "мигает")) {
    return "Lighting";
  }
  if (has("мусор", "контейнер", "свалк", "пакет", "грязь")) {
    return "Trash";
  }
  if (has("вода", "канализа", "теч", "прорв", "тепло", "отоплен", "газ", "труба")) {
    return "Utilities";
  }
  if (has("искрит", "огол", "опасно", "обрыв", "авар", "открыт", "люк", "пожар", "взрыв")) {
    return "Safety";
  }
  return "Unsorted";
}

function normalizePriorityForSite(description) {
  const text = String(description || "").toLowerCase();
  const has = (...words) => words.some((w) => text.includes(w));

  if (
    has("искрит", "огол", "опасно", "обрыв", "авар", "открыт", "люк", "пожар", "взрыв") ||
    has("срочно", "утечка газа", "затопление")
  ) {
    return "High";
  }

  if (
    text.includes("низкий приоритет") ||
    text.includes("несрочно") ||
    text.includes("не срочно") ||
    has("граффити", "наклейк", "листовк", "космет")
  ) {
    return "Low";
  }

  return "Medium";
}

async function sendRequestToAppsScript(payload) {
  if (!SITE_WEBAPP_URL || !SITE_SHARED_SECRET) {
    throw new Error("MISSING_WEBAPP_CONFIG");
  }

  const res = await fetch(SITE_WEBAPP_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },
    body: JSON.stringify({
      ...payload,
      secret: SITE_SHARED_SECRET
    })
  });

  const data = await res.json();
  if (!res.ok || !data.ok) {
    throw new Error(data.error || `HTTP_${res.status}`);
  }
  return data;
}

// ----------------- auth storage -----------------
function getUsers() {
  const raw = localStorage.getItem(USERS_KEY);
  if (!raw) return [];
  const parsed = safeJsonParse(raw, []);
  return Array.isArray(parsed) ? parsed : [];
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getRequests() {
  const raw = localStorage.getItem(REQUESTS_KEY);
  if (!raw) return [];
  const parsed = safeJsonParse(raw, []);
  return Array.isArray(parsed) ? parsed : [];
}

function saveRequests(requests) {
  localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));
}

function normalizeSessionUser(user) {
  if (!user || typeof user !== "object") return null;

  return {
    id: user.id ?? Date.now(),
    username: String(user.username || "").trim(),
    email: String(user.email || "").trim(),
    createdAt: user.createdAt || new Date().toISOString(),
  };
}

function getCurrentUser() {
  const rawCurrent = localStorage.getItem(CURRENT_USER_KEY);

  if (rawCurrent) {
    const parsed = safeJsonParse(rawCurrent, null);
    if (parsed && typeof parsed === "object") {
      return parsed;
    }
  }

  const legacy = localStorage.getItem(LEGACY_USER_KEY);
  if (!legacy) return null;

  const parsedLegacy = safeJsonParse(legacy, null);

  if (parsedLegacy && typeof parsedLegacy === "object") {
    return normalizeSessionUser(parsedLegacy);
  }

  if (typeof legacy === "string" && legacy.trim()) {
    return {
      id: Date.now(),
      username: legacy.trim(),
      email: "",
      createdAt: new Date().toISOString(),
    };
  }

  return null;
}

function setCurrentUser(user) {
  const safeUser = normalizeSessionUser(user);
  if (!safeUser) return;

  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safeUser));
  localStorage.setItem(SESSION_KEY, "true");

  // совместимость со старой логикой
  localStorage.setItem(LEGACY_SESSION_KEY, "true");
  localStorage.setItem(LEGACY_USER_KEY, JSON.stringify(safeUser));
}

function clearCurrentUser() {
  localStorage.removeItem(CURRENT_USER_KEY);
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(LEGACY_SESSION_KEY);
  localStorage.removeItem(LEGACY_USER_KEY);
}

function isLoggedIn() {
  const hasSession =
    localStorage.getItem(SESSION_KEY) === "true" ||
    localStorage.getItem(LEGACY_SESSION_KEY) === "true";

  return hasSession && !!getCurrentUser();
}

// ----------------- auth UI -----------------
function initAuthUI() {
  const registerBtnDesktop = el("registerBtnDesktop");
  const loginBtnDesktop = el("loginBtnDesktop");
  const logoutBtnDesktop = el("logoutBtnDesktop");

  const registerBtnMobile = el("registerBtnMobile");
  const loginBtnMobile = el("loginBtnMobile");
  const logoutBtnMobile = el("logoutBtnMobile");

  const userBoxDesktop = el("userBoxDesktop");
  const userBoxMobile = el("userBoxMobile");
  const headerUsername = el("headerUsername");
  const mobileUsername = el("mobileUsername");

  const currentUser = getCurrentUser();
  const loggedIn = isLoggedIn();

  function show(node) {
    if (node) node.style.display = "";
  }

  function hide(node) {
    if (node) node.style.display = "none";
  }

  function logout() {
    clearCurrentUser();
    window.location.href = "index.html";
  }

  if (loggedIn && currentUser) {
    hide(registerBtnDesktop);
    hide(loginBtnDesktop);
    show(logoutBtnDesktop);

    hide(registerBtnMobile);
    hide(loginBtnMobile);
    show(logoutBtnMobile);

    if (headerUsername) {
      headerUsername.textContent = currentUser.username || "Пользователь";
    }

    if (mobileUsername) {
      mobileUsername.textContent = currentUser.username || "Пользователь";
    }

    show(userBoxDesktop);
    show(userBoxMobile);
  } else {
    show(registerBtnDesktop);
    show(loginBtnDesktop);
    hide(logoutBtnDesktop);

    show(registerBtnMobile);
    show(loginBtnMobile);
    hide(logoutBtnMobile);

    hide(userBoxDesktop);
    hide(userBoxMobile);
  }

  if (logoutBtnDesktop) {
    logoutBtnDesktop.addEventListener("click", logout);
  }

  if (logoutBtnMobile) {
    logoutBtnMobile.addEventListener("click", (e) => {
      e.preventDefault();
      logout();
    });
  }
}

// ----------------- login / register -----------------
function initPasswordToggle() {
  const toggleBtn = el("togglePassword");
  const passwordInput = el("password") || el("loginPassword");

  if (!toggleBtn || !passwordInput) return;

  toggleBtn.addEventListener("click", () => {
    const isPassword = passwordInput.type === "password";
    passwordInput.type = isPassword ? "text" : "password";
    toggleBtn.textContent = isPassword ? "🙈" : "👁";
  });
}

function initLoginForm() {
  const form = el("loginForm");
  if (!form) return;

  const usernameInput = el("username") || el("loginLogin");
  const passwordInput = el("password") || el("loginPassword");

  if (!usernameInput || !passwordInput) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const loginValue = usernameInput.value.trim();
    const passwordValue = passwordInput.value.trim();

    if (!loginValue || !passwordValue) {
      alert("Заполните логин/email и пароль.");
      return;
    }

    const users = getUsers();

    if (!users.length) {
      alert("Пользователи не найдены. Сначала зарегистрируйтесь.");
      return;
    }

    const normalizedLogin = loginValue.toLowerCase();

    const foundUser = users.find((user) => {
      const username = String(user.username || "").trim().toLowerCase();
      const email = String(user.email || "").trim().toLowerCase();
      const password = String(user.password || "");

      return (
        (username === normalizedLogin || email === normalizedLogin) &&
        password === passwordValue
      );
    });

    if (!foundUser) {
      alert("Неверный логин/email или пароль.");
      return;
    }

    setCurrentUser(foundUser);
    window.location.href = "index.html";
  });
}

/**
 * Опциональная логика для register.html
 * Сработает, если на странице есть:
 * - form#registerForm
 * - #registerUsername
 * - #registerEmail
 * - #registerPassword
 */
function initRegisterForm() {
  const form = el("registerForm");
  if (!form) return;

  const usernameInput = el("registerUsername");
  const emailInput = el("registerEmail");
  const passwordInput = el("registerPassword");
  const confirmInput = el("registerPasswordConfirm");

  if (!usernameInput || !emailInput || !passwordInput) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const username = usernameInput.value.trim();
    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value.trim();
    const confirmPassword = confirmInput ? confirmInput.value.trim() : password;

    if (!username || !email || !password) {
      alert("Заполните все поля регистрации.");
      return;
    }

    if (password.length < 4) {
      alert("Пароль должен быть не короче 4 символов.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Пароли не совпадают.");
      return;
    }

    const users = getUsers();

    const usernameExists = users.some(
      (u) => String(u.username || "").trim().toLowerCase() === username.toLowerCase()
    );

    if (usernameExists) {
      alert("Этот логин уже занят.");
      return;
    }

    const emailExists = users.some(
      (u) => String(u.email || "").trim().toLowerCase() === email
    );

    if (emailExists) {
      alert("Этот email уже зарегистрирован.");
      return;
    }

    const newUser = {
      id: Date.now(),
      username,
      email,
      password, // для MVP / демо
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    saveUsers(users);
    setCurrentUser(newUser);

    window.location.href = "index.html";
  });
}

// ----------------- bot links -----------------
function bindBotLinks() {
  const ids = [
    "openBotTop",
    "openBotHero",
    "openBotCta",
    "openBotFooter",
    "openBotMobile",
    "openBotInline"
  ];

  ids.forEach((id) => {
    const a = el(id);
    if (a) a.setAttribute("href", SAFE_BOT_LINK);
  });

  const botLinkText = el("botLinkText");
  if (botLinkText) {
    botLinkText.textContent = SAFE_BOT_LINK;
  }
}

// ----------------- FAQ -----------------
function initFAQ() {
  const faqItems = document.querySelectorAll(".faqItem");
  if (!faqItems.length) return;

  faqItems.forEach((item) => {
    const btn = item.querySelector(".faqBtn");
    if (!btn) return;

    btn.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");
      faqItems.forEach((i) => i.classList.remove("open"));
      if (!isOpen) item.classList.add("open");
    });
  });
}

// ----------------- mobile menu -----------------
function initMobileMenu() {
  const burger = el("burger");
  const menu = el("mobileMenu");
  if (!burger || !menu) return;

  burger.addEventListener("click", () => {
    menu.classList.toggle("open");
  });

  menu.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => {
      menu.classList.remove("open");
    });
  });
}

// ----------------- smooth scroll -----------------
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href");
      if (!href || href === "#") return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

// ----------------- QR -----------------
function renderQR() {
  const qrBox = el("qrBox");
  if (!qrBox) return;

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(SAFE_BOT_LINK)}`;

  const img = new Image();
  img.alt = "QR";
  img.style.cssText = "width:140px;height:140px;border-radius:16px";

  img.onload = () => {
    qrBox.innerHTML = "";
    qrBox.appendChild(img);
  };

  img.onerror = () => {
    qrBox.innerHTML = `QR недоступен<br><span class="qrSub">Скопируйте ссылку ниже</span>`;
  };

  img.src = qrUrl;
}

// ----------------- request form state -----------------
const state = {
  category: "Освещение",
  city: "Петропавловск",
  desc: "",
  lat: null,
  lng: null,
  photoDataUrl: null,
};

function syncOutput() {
  const outCategory = el("outCategory");
  const outCity = el("outCity");
  const outCoords = el("outCoords");

  if (outCategory) outCategory.textContent = state.category || "—";
  if (outCity) outCity.textContent = state.city || "—";

  if (outCoords) {
    if (state.lat != null && state.lng != null) {
      outCoords.textContent = `${state.lat.toFixed(6)}, ${state.lng.toFixed(6)}`;
    } else {
      outCoords.textContent = "—";
    }
  }

  const latInput = el("latInput");
  const lngInput = el("lngInput");

  if (latInput) latInput.value = state.lat != null ? state.lat.toFixed(6) : "";
  if (lngInput) lngInput.value = state.lng != null ? state.lng.toFixed(6) : "";
}

function buildDraftText() {
  const coordsText =
    state.lat != null && state.lng != null
      ? `${state.lat.toFixed(6)}, ${state.lng.toFixed(6)}`
      : "точка не выбрана";

  const osmLink =
    state.lat != null && state.lng != null
      ? `https://www.openstreetmap.org/?mlat=${state.lat.toFixed(6)}&mlon=${state.lng.toFixed(6)}#map=18/${state.lat.toFixed(6)}/${state.lng.toFixed(6)}`
      : "—";

  return `🟦 Aqyldy Qala — обращение
Категория: ${state.category || "—"}
Город/район: ${state.city || "—"}
Координаты: ${coordsText}
Карта: ${osmLink}

Описание:
${state.desc || "—"}

📌 Дальше:
1) Прикрепите фото (если есть)
2) Отправьте геолокацию точкой в Telegram`;
}

async function goToTelegramWithDraft(draftText) {
  const copied = await copyToClipboard(draftText);

  const deepLink =
    `https://t.me/${BOT_USERNAME}?start=${encodeURIComponent(START_PARAM)}&text=${encodeURIComponent(draftText)}`;

  if (isMobileLike()) {
    openLink(deepLink);
    return;
  }

  if (copied) {
    alert("Текст обращения скопирован. Сейчас откроется бот — вставьте текст (Ctrl+V) и отправьте.");
  } else {
    alert("Сейчас откроется бот. Если текст не подставился, вставьте его вручную.");
  }

  openLink(SAFE_BOT_LINK);
}

// ----------------- demo / request form -----------------
let map = null;
let marker = null;

function setPoint(lat, lng, pan = false) {
  state.lat = lat;
  state.lng = lng;
  syncOutput();

  if (!map || typeof window.L === "undefined") return;

  if (!marker) {
    marker = window.L.marker([lat, lng], { draggable: true }).addTo(map);

    marker.on("dragend", () => {
      const p = marker.getLatLng();
      state.lat = p.lat;
      state.lng = p.lng;
      syncOutput();
    });
  } else {
    marker.setLatLng([lat, lng]);
  }

  if (pan) {
    map.setView([lat, lng], Math.max(map.getZoom(), 15));
  }
}

function initLeafletMap() {
  const mapEl = el("leafletMap");
  if (!mapEl || typeof window.L === "undefined") return;

  const startLat = 54.8726;
  const startLng = 69.1430;

  map = window.L.map("leafletMap", {
    scrollWheelZoom: !isMobileLike()
  }).setView([startLat, startLng], 12);

  window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap",
  }).addTo(map);

  map.on("click", (e) => {
    setPoint(e.latlng.lat, e.latlng.lng, false);
  });
}

function initDemoForm() {
  const requestForm = el("requestForm");
  if (!requestForm) return;

  const categorySelect = el("categorySelect");
  const cityInput = el("cityInput");
  const descInput = el("descInput");
  const photoInput = el("photoInput");
  const photoPreview = el("photoPreview");
  const resetBtn = el("resetDraft");
  const useMyLocationBtn = el("useMyLocation");
  function resetDraft() {
    state.category = "Освещение";
    state.city = "Петропавловск";
    state.desc = "";
    state.lat = null;
    state.lng = null;
    state.photoDataUrl = null;

    if (categorySelect) categorySelect.value = state.category;
    if (cityInput) cityInput.value = state.city;
    if (descInput) descInput.value = "";
    if (photoInput) photoInput.value = "";

    if (photoPreview) {
      photoPreview.innerHTML =
        `<div class="photoPlaceholder">Нажмите или перетащите фото<br><span class="photoSub">JPG / PNG</span></div>`;
    }

    if (marker && map) {
      map.removeLayer(marker);
      marker = null;
    }

    syncOutput();
  }

  if (categorySelect) {
    categorySelect.addEventListener("change", () => {
      state.category = categorySelect.value;
      syncOutput();
    });
  }

  if (cityInput) {
    cityInput.addEventListener("input", () => {
      state.city = cityInput.value.trim();
      syncOutput();
    });
  }

  if (descInput) {
    descInput.addEventListener("input", () => {
      state.desc = descInput.value.trim();
    });
  }

  if (photoInput && photoPreview) {
    photoInput.addEventListener("change", () => {
      const file = photoInput.files && photoInput.files[0];

      if (!file) {
        state.photoDataUrl = null;
        photoPreview.innerHTML =
          `<div class="photoPlaceholder">Нажмите или перетащите фото<br><span class="photoSub">JPG / PNG</span></div>`;
        return;
      }

      const url = URL.createObjectURL(file);
      photoPreview.innerHTML = `<img src="${url}" alt="Фото проблемы">`;

      const reader = new FileReader();
      reader.onload = () => {
        state.photoDataUrl = typeof reader.result === "string" ? reader.result : null;
      };
      reader.readAsDataURL(file);
    });

    const drop = photoPreview.closest(".photoDrop");
    if (drop) {
      drop.addEventListener("dragover", (e) => {
        e.preventDefault();
        drop.style.opacity = "0.9";
      });

      drop.addEventListener("dragleave", () => {
        drop.style.opacity = "1";
      });

      drop.addEventListener("drop", (e) => {
        e.preventDefault();
        drop.style.opacity = "1";

        const file = e.dataTransfer.files && e.dataTransfer.files[0];
        if (!file) return;

        const dt = new DataTransfer();
        dt.items.add(file);
        photoInput.files = dt.files;
        photoInput.dispatchEvent(new Event("change"));
      });
    }
  }

  if (useMyLocationBtn) {
    useMyLocationBtn.addEventListener("click", () => {
      if (!navigator.geolocation) {
        alert("Геолокация не поддерживается в вашем браузере.");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setPoint(latitude, longitude, true);
        },
        () => {
          alert("Не удалось получить местоположение. Разрешите доступ к геолокации.");
        }
      );
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", resetDraft);
  }

  requestForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!isLoggedIn()) {
      alert("Сначала войдите в аккаунт.");
      window.location.href = "login.html";
      return;
    }

    if (!state.desc) {
      alert("Опишите проблему.");
      if (descInput) descInput.focus();
      return;
    }

    const hasGeo = Number.isFinite(state.lat) && Number.isFinite(state.lng);
    const hasAddress = !!state.city;
    if (!hasGeo && !hasAddress) {
      alert("Нужно указать место: адрес или точку на карте.");
      if (cityInput) cityInput.focus();
      return;
    }

    const currentUser = getCurrentUser();
    const requests = getRequests();

    const classificationCategory = normalizeCategoryForSite(state.desc);
    const classificationPriority = normalizePriorityForSite(state.desc);

    const chatId = String(currentUser?.telegramChatId || currentUser?.id || "");

    const payload = {
      chat_id: chatId,
      telegram_user_id: currentUser?.id || "",
      user_name: currentUser?.username || "Пользователь",
      description: state.desc,
      lat: hasGeo ? state.lat : undefined,
      lng: hasGeo ? state.lng : undefined,
      address_text: state.city || "",
      photo_file_id: "",
      photo_url: state.photoDataUrl || "",
      category: classificationCategory,
      priority: classificationPriority,
      confidence: "",
      tags: "web;site",
    };

    const requestItem = {
      id: Date.now(),
      authorId: currentUser?.id ?? null,
      authorUsername: currentUser?.username || "Пользователь",
      category: classificationCategory,
      city: state.city,
      description: state.desc,
      lat: state.lat,
      lng: state.lng,
      photoDataUrl: state.photoDataUrl,
      status: "New",
      createdAt: new Date().toISOString(),
    };

    try {
      const out = await sendRequestToAppsScript(payload);

      requestItem.request_id = out.request_id || "";
      requests.unshift(requestItem);
      saveRequests(requests);

      alert(`✅ Отправлено в Google Sheets. ID: ${out.request_id || "(без ID)"}`);

      resetDraft();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);

      alert(`Ошибка отправки: ${message}`);
    }
  });

  syncOutput();
}

// ----------------- boot -----------------
function initApp() {
  const yearEl = el("year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  bindBotLinks();
  initAuthUI();
  initPasswordToggle();
  initLoginForm();
  initRegisterForm();
  initFAQ();
  initMobileMenu();
  renderQR();
  initSmoothScroll();
  initDemoForm();

  window.addEventListener("load", initLeafletMap);
}

document.addEventListener("DOMContentLoaded", initApp);