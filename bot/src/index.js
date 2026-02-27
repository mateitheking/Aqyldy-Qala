// bot/src/index.js
const { Telegraf, Markup } = require("telegraf");
const axios = require("axios");
require("dotenv").config();
const { classifyIssue } = require("./classifier");

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
if (!BOT_TOKEN) {
  console.error("Missing TELEGRAM_BOT_TOKEN in .env");
  process.exit(1);
}

const WEBAPP_URL = (process.env.APPS_SCRIPT_WEBAPP_URL || "").trim();
const SHARED_SECRET = (process.env.APPS_SCRIPT_SHARED_SECRET || "").trim();
const SHEET_NAME = process.env.REQUESTS_SHEET_NAME || "Requests";

const bot = new Telegraf(BOT_TOKEN);

// ---------------------- Session (in-memory) ----------------------
const sessions = new Map(); // chatId -> { state, data, lang }
const localStore = new Map(); // chatId -> [requests] (fallback if no backend)

function s(chatId) {
  if (!sessions.has(chatId)) sessions.set(chatId, { state: "idle", data: {}, lang: "ru" });
  return sessions.get(chatId);
}

// IMPORTANT: do NOT wipe language on reset
function resetFlow(chatId) {
  const ses = s(chatId);
  ses.state = "idle";
  ses.data = {};
}

// ---------------------- i18n (localization) ----------------------
const SUPPORTED_LANGS = ["ru", "kk", "en"];
const DEFAULT_LANG = "ru";

const I18N = {
  ru: {
    lang_name: "Русский",
    choose_lang_title: "🌐 Выберите язык:",
    menu_title: "Главное меню:",
    welcome: "Здравствуйте! Aqyldy Qala бот.\nВыберите действие:",
    menu_new: "📨 Отправить новый запрос",
    menu_my: "📋 Мои обращения",
    menu_profile: "👤 Профиль",
    menu_lang: "🌐 Язык",

    word_yes: "да",
    word_no: "нет",

    ask_description: "Опишите проблему (одним сообщением):",
    err_empty_description: "Описание не может быть пустым. Введите ещё раз:",
    location_choice: "Укажите место (выберите вариант):",
    btn_send_geo: "📍 Отправить геолокацию",
    btn_enter_addr: "⌨️ Ввести адрес вручную",
    btn_back: "↩️ Назад",

    ask_geo: "Отправьте геолокацию (скрепка → Геопозиция).",
    ask_addr: "Введите адрес (город/посёлок, улица, дом). Можно добавить ориентир:",
    err_empty_address: "Адрес не может быть пустым. Введите ещё раз:",
    ask_photo: "Загрузите фото (по желанию) или нажмите «Пропустить».",
    btn_skip_photo: "Пропустить фото",

    confirm_title: "✅ Проверьте заявку перед отправкой:",
    confirm_desc: "📝 Описание: {desc}",
    confirm_addr: "🏠 Адрес: {addr}",
    confirm_geo: "📍 Геолокация: {lat}, {lng}",
    confirm_photo: "📷 Фото: {hasPhoto}",

    btn_confirm: "✅ Подтвердить",
    btn_cancel: "❌ Отмена",

    cancelled: "Заявка отменена.",
    err_need_desc_loc: "Ошибка: нужно описание и место (адрес или геолокация). Начните заново.",
    accepted_local: "✅ Заявка принята (локально, backend ещё не подключён).\nID: {id}\nСтатус: New",
    sent_ok: "✅ Заявка отправлена!\nID: {id}\nСтатус: New",
    send_error: "Ошибка при отправке: {err}",
    conn_error: "Ошибка связи: {err}",

    my_none: "У вас пока нет обращений.",
    my_title: "📋 Ваши обращения:",
    my_error: "Ошибка получения заявок: {err}",
    apps_error: "Ошибка связи с Apps Script: {err}",

    profile_text:
      "👤 Профиль (MVP): пока не обязателен.\n" +
      "Если нужно — добавим имя/телефон и будем прикреплять к обращению.\n\n" +
      "Пока используем Telegram ID автоматически.",

    lang_changed: "✅ Язык изменён: {langName}",
    my_page_title: "📄 Обращение {i}/{n} (новое сверху)",
    btn_archive: "🗑️ Архивировать",
    archived_ok: "✅ Обращение архивировано.",
    archived_err: "Ошибка архивации: {err}",
    no_requests: "У вас пока нет обращений.",
    label_status: "Статус",
    label_category: "Категория",
    label_priority: "Приоритет",
    label_comment: "Комментарий",
    label_created: "Создано",
    label_id: "ID",
    label_address: "Адрес",
    label_geo: "Гео",
    label_photo: "Фото",
  },

  kk: {
    lang_name: "Қазақша",
    choose_lang_title: "🌐 Тілді таңдаңыз:",
    menu_title: "Басты мәзір:",
    welcome: "Сәлеметсіз бе! Aqyldy Qala боты.\nӘрекетті таңдаңыз:",
    menu_new: "📨 Жаңа өтініш жіберу",
    menu_my: "📋 Менің өтініштерім",
    menu_profile: "👤 Профиль",
    menu_lang: "🌐 Тіл",

    word_yes: "иә",
    word_no: "жоқ",

    ask_description: "Мәселені сипаттаңыз (бір хабарлама):",
    err_empty_description: "Сипаттама бос болмауы керек. Қайта енгізіңіз:",
    location_choice: "Орнын көрсетіңіз (нұсқаны таңдаңыз):",
    btn_send_geo: "📍 Геолокация жіберу",
    btn_enter_addr: "⌨️ Мекенжайды қолмен енгізу",
    btn_back: "↩️ Артқа",

    ask_geo: "Геолокацияны жіберіңіз (қысқыш → Геопозиция).",
    ask_addr: "Мекенжайды енгізіңіз (қала/ауыл, көше, үй). Қаласаңыз бағдар қоса аласыз:",
    err_empty_address: "Мекенжай бос болмауы керек. Қайта енгізіңіз:",
    ask_photo: "Фотоны жүктеңіз (қалау бойынша) немесе «Өткізу» басыңыз.",
    btn_skip_photo: "Фотоны өткізу",

    confirm_title: "✅ Жіберер алдында тексеріңіз:",
    confirm_desc: "📝 Сипаттама: {desc}",
    confirm_addr: "🏠 Мекенжай: {addr}",
    confirm_geo: "📍 Геолокация: {lat}, {lng}",
    confirm_photo: "📷 Фото: {hasPhoto}",

    btn_confirm: "✅ Растау",
    btn_cancel: "❌ Болдырмау",

    cancelled: "Өтініш болдырмады.",
    err_need_desc_loc: "Қате: сипаттама және орын қажет (мекенжай немесе геолокация). Қайтадан бастаңыз.",
    accepted_local: "✅ Өтініш қабылданды (локалды, backend қосылмаған).\nID: {id}\nКүйі: New",
    sent_ok: "✅ Өтініш жіберілді!\nID: {id}\nКүйі: New",
    send_error: "Жіберу қатесі: {err}",
    conn_error: "Байланыс қатесі: {err}",

    my_none: "Сізде әзірге өтініш жоқ.",
    my_title: "📋 Менің өтініштерім:",
    my_error: "Өтініштерді алу қатесі: {err}",
    apps_error: "Apps Script байланыс қатесі: {err}",

    profile_text:
      "👤 Профиль (MVP): міндетті емес.\n" +
      "Қажет болса — аты/телефон қосамыз.\n\n" +
      "Қазір Telegram ID қолданылады.",

    lang_changed: "✅ Тіл өзгертілді: {langName}",
    my_page_title: "📄 Өтініш {i}/{n} (ең жаңасы жоғарыда)",
    btn_archive: "🗑️ Мұрағаттау",
    archived_ok: "✅ Өтініш мұрағатқа жіберілді.",
    archived_err: "Мұрағаттау қатесі: {err}",
    no_requests: "Сізде әзірге өтініш жоқ.",
    label_status: "Күйі",
    label_category: "Санат",
    label_priority: "Маңыздылығы",
    label_comment: "Пікір",
    label_created: "Құрылған уақыты",
    label_id: "ID",
    label_address: "Мекенжай",
    label_geo: "Гео",
    label_photo: "Фото",
  },

  en: {
    lang_name: "English",
    choose_lang_title: "🌐 Choose language:",
    menu_title: "Main menu:",
    welcome: "Hello! Aqyldy Qala bot.\nChoose an action:",
    menu_new: "📨 Send new request",
    menu_my: "📋 My requests",
    menu_profile: "👤 Profile",
    menu_lang: "🌐 Language",

    word_yes: "yes",
    word_no: "no",

    ask_description: "Describe the issue (one message):",
    err_empty_description: "Description cannot be empty. Try again:",
    location_choice: "Choose location method:",
    btn_send_geo: "📍 Send geolocation",
    btn_enter_addr: "⌨️ Enter address manually",
    btn_back: "↩️ Back",

    ask_geo: "Send your geolocation (paperclip → Location).",
    ask_addr: "Enter address (city, street, house). You may add a landmark:",
    err_empty_address: "Address cannot be empty. Try again:",
    ask_photo: "Upload a photo (optional) or press “Skip”.",
    btn_skip_photo: "Skip photo",

    confirm_title: "✅ Please review before sending:",
    confirm_desc: "📝 Description: {desc}",
    confirm_addr: "🏠 Address: {addr}",
    confirm_geo: "📍 Geo: {lat}, {lng}",
    confirm_photo: "📷 Photo: {hasPhoto}",

    btn_confirm: "✅ Confirm",
    btn_cancel: "❌ Cancel",

    cancelled: "Request cancelled.",
    err_need_desc_loc: "Error: description and location are required. Start again.",
    accepted_local: "✅ Request accepted (local, backend not connected).\nID: {id}\nStatus: New",
    sent_ok: "✅ Request sent!\nID: {id}\nStatus: New",
    send_error: "Send error: {err}",
    conn_error: "Connection error: {err}",

    my_none: "You have no requests yet.",
    my_title: "📋 Your requests:",
    my_error: "Failed to get requests: {err}",
    apps_error: "Apps Script error: {err}",

    profile_text:
      "👤 Profile (MVP): not required.\n" +
      "If needed, we will add name/phone later.\n\n" +
      "Currently we use Telegram ID.",

    lang_changed: "✅ Language changed: {langName}",
    my_page_title: "📄 Request {i}/{n} (newest first)",
    btn_archive: "🗑️ Archive",
    archived_ok: "✅ Request archived.",
    archived_err: "Archive error: {err}",
    no_requests: "You have no requests yet.",
    label_status: "Status",
    label_category: "Category",
    label_priority: "Priority",
    label_comment: "Comment",
    label_created: "Created",
    label_id: "ID",
    label_address: "Address",
    label_geo: "Geo",
    label_photo: "Photo",
  }
};

function getLang(ctx) {
  const chatId = ctx.chat?.id;
  const ses = chatId ? sessions.get(chatId) : null;
  const lang = ses?.lang;
  return SUPPORTED_LANGS.includes(lang) ? lang : DEFAULT_LANG;
}

function setLang(chatId, lang) {
  const ses = s(chatId);
  ses.lang = SUPPORTED_LANGS.includes(lang) ? lang : DEFAULT_LANG;
}

function t(lang, key, params = {}) {
  const dict = I18N[lang] || I18N[DEFAULT_LANG];
  let str = dict[key] ?? I18N[DEFAULT_LANG][key] ?? key;
  for (const [k, v] of Object.entries(params)) {
    str = str.replaceAll(`{${k}}`, String(v));
  }
  return str;
}

function anyLabel(key) {
  return SUPPORTED_LANGS.map((L) => I18N[L][key]).filter(Boolean);
}

// ---------------------- UI helpers ----------------------
function menuKeyboard(lang) {
  return Markup.keyboard([
    [t(lang, "menu_new")],
    [t(lang, "menu_my")],
    [t(lang, "menu_profile")],
    [t(lang, "menu_lang")]
  ]).resize();
}

function locationChoiceKeyboard(lang) {
  return Markup.inlineKeyboard([
    [Markup.button.callback(t(lang, "btn_send_geo"), "loc_geo")],
    [Markup.button.callback(t(lang, "btn_enter_addr"), "loc_addr")],
    [Markup.button.callback(t(lang, "btn_back"), "back_to_menu")]
  ]);
}

function skipPhotoKeyboard(lang) {
  return Markup.inlineKeyboard([
    [Markup.button.callback(t(lang, "btn_skip_photo"), "skip_photo")],
    [Markup.button.callback(t(lang, "btn_back"), "back_to_menu")]
  ]);
}

function confirmKeyboard(lang) {
  return Markup.inlineKeyboard([
    [Markup.button.callback(t(lang, "btn_confirm"), "confirm_request")],
    [Markup.button.callback(t(lang, "btn_cancel"), "cancel_request")]
  ]);
}

function formatConfirmCaption(lang, d) {
  const lines = [];

  // ВАЖНО: сначала детали
  lines.push(t(lang, "confirm_desc", { desc: d.description || "-" }));

  if (d.address_text) lines.push(t(lang, "confirm_addr", { addr: d.address_text }));
  if (d.lat && d.lng) lines.push(t(lang, "confirm_geo", { lat: d.lat, lng: d.lng }));

  // затем пустая строка и заголовок проверки в конце
  lines.push("");
  lines.push(t(lang, "confirm_title"));

  return lines.join("\n");
}

async function sendConfirm(ctx, lang, data) {
  const caption = formatConfirmCaption(lang, data);
  const kb = confirmKeyboard(lang);

  // Если есть фото — отправляем фото с caption в том же сообщении + кнопки
  if (data.photo_file_id) {
    return ctx.replyWithPhoto(data.photo_file_id, { caption, ...kb });
  }

  // Если фото нет — обычный текст + кнопки
  return ctx.reply(caption, kb);
}

function formatHumanDate(iso) {
  if (!iso) return "-";
  const s = String(iso).trim();

  // Expected: 2026-02-28T02:45:08+05:00
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!m) return s;

  const [, y, mo, d, hh, mm] = m;
  // Remove leading zero from hour for nicer look (02 -> 2)
  const h = String(parseInt(hh, 10));
  return `${y}-${mo}-${d} ${h}:${mm}`;
}

function short(s0, n = 60) {
  if (!s0) return "";
  const tt = String(s0).trim();
  return tt.length <= n ? tt : tt.slice(0, n - 1) + "…";
}

function hasLocation(d) {
  const hasGeo = Number.isFinite(d.lat) && Number.isFinite(d.lng);
  const hasAddr = typeof d.address_text === "string" && d.address_text.trim().length > 0;
  return hasGeo || hasAddr;
}

// ---------------------- Debug / safety ----------------------
bot.use((ctx, next) => {
  const kind =
    ctx.updateType ||
    (ctx.message?.text ? "text" : ctx.message?.location ? "location" : "other");
  console.log("UPDATE:", kind, "from chat", ctx.chat?.id);
  return next();
});

bot.catch((err) => {
  console.error("BOT ERROR:", err);
});

// ---------------------- Backend calls (Apps Script) ----------------------
async function createRequestViaWebApp(payload) {
  const res = await axios.post(WEBAPP_URL, payload, { timeout: 20000 });
  return res.data;
}

async function getMyRequestsViaWebApp(chatId) {
  const res = await axios.get(WEBAPP_URL, {
    timeout: 20000,
    params: {
      action: "getByChatId",
      secret: SHARED_SECRET,
      chat_id: chatId
    }
  });
  return res.data;
}

// ---------------------- My Requests (pagination + archive) ----------------------

async function archiveRequestViaWebApp(chatId, requestId) {
  const res = await axios.post(
    WEBAPP_URL,
    {
      action: "archive",
      secret: SHARED_SECRET,
      chat_id: chatId,
      request_id: requestId
    },
    { timeout: 20000 }
  );
  return res.data;
}

const STATUS_LABELS = {
  ru: { New: "Новая", "In progress": "В работе", "Need info": "Нужно уточнение", Done: "Решено", Rejected: "Отклонено" },
  kk: { New: "Жаңа", "In progress": "Жұмыста", "Need info": "Қосымша ақпарат қажет", Done: "Шешілді", Rejected: "Қабылданбады" },
  en: { New: "New", "In progress": "In progress", "Need info": "Need info", Done: "Done", Rejected: "Rejected" }
};

const CATEGORY_LABELS = {
  ru: { Roads: "Дороги", Lighting: "Освещение", Trash: "Мусор", Utilities: "Коммунальные", Safety: "Опасность", Unsorted: "Не определено" },
  kk: { Roads: "Жолдар", Lighting: "Жарықтандыру", Trash: "Қоқыс", Utilities: "Коммуналдық", Safety: "Қауіп", Unsorted: "Анықталмады" },
  en: { Roads: "Roads", Lighting: "Lighting", Trash: "Trash", Utilities: "Utilities", Safety: "Safety", Unsorted: "Unsorted" }
};

const PRIORITY_LABELS = {
  ru: { Low: "Низкий", Medium: "Средний", High: "Высокий" },
  kk: { Low: "Төмен", Medium: "Орта", High: "Жоғары" },
  en: { Low: "Low", Medium: "Medium", High: "High" }
};

function mapLabel(map, lang, value) {
  if (!value) return "-";
  return (map[lang] && map[lang][value]) || value;
}

function myNavKeyboard(lang, page, total, requestId) {
  const prevCb = page > 0 ? `my:page:${page - 1}` : "noop";
  const nextCb = page < total - 1 ? `my:page:${page + 1}` : "noop";

  return Markup.inlineKeyboard([
    [
      Markup.button.callback("⬅️", prevCb),
      Markup.button.callback(`${page + 1}/${total}`, "noop"),
      Markup.button.callback("➡️", nextCb)
    ],
    [Markup.button.callback(t(lang, "btn_archive"), `my:archive:${requestId}:${page}`)]
  ]);
}

function formatMyRequestPage(lang, item, page, total) {
  const status = mapLabel(STATUS_LABELS, lang, item.status);
  const category = mapLabel(CATEGORY_LABELS, lang, item.category);
  const priority = mapLabel(PRIORITY_LABELS, lang, item.priority);

  const lines = [];
  lines.push(t(lang, "my_page_title", { i: page + 1, n: total }));
  lines.push("");
  lines.push(`${t(lang, "label_id")}: ${item.request_id || "-"}`);
  lines.push(`${t(lang, "label_status")}: ${status}`);
  lines.push(`${t(lang, "label_category")}: ${category}`);
  lines.push(`${t(lang, "label_priority")}: ${priority}`);
  lines.push(`${t(lang, "label_created")}: ${formatHumanDate(item.created_at)}`);

  if (item.address_text) lines.push(`${t(lang, "label_address")}: ${item.address_text}`);
  if (item.lat && item.lng) lines.push(`${t(lang, "label_geo")}: ${item.lat}, ${item.lng}`);

  lines.push("");
  lines.push(`📝 ${item.description || "-"}`);

  lines.push("");
  lines.push(`${t(lang, "label_comment")}: ${item.public_comment ? item.public_comment : "-"}`);

  return lines.join("\n");
}

async function renderMyRequests(ctx, lang, page, edit = false) {
  const chatId = ctx.chat.id;

  if (!WEBAPP_URL || !SHARED_SECRET) {
    const arr = localStore.get(chatId) || [];
    if (arr.length === 0) return ctx.reply(t(lang, "no_requests"));
    const total = arr.length;
    const safePage = Math.max(0, Math.min(page, total - 1));
    const item = arr[safePage];

    const text = formatMyRequestPage(lang, item, safePage, total);
    const kb = myNavKeyboard(lang, safePage, total, item.request_id);

    if (edit) {
      try { return await ctx.editMessageText(text, kb); } catch { return ctx.reply(text, kb); }
    }
    return ctx.reply(text, kb);
  }

  const out = await getMyRequestsViaWebApp(chatId);
  if (!out || !out.ok) return ctx.reply(t(lang, "my_error", { err: (out && out.error) || "UNKNOWN" }));

  const items = out.items || [];
  if (items.length === 0) return ctx.reply(t(lang, "no_requests"));

  // items already newest-first in Apps Script; still ensure newest-first:
  const total = items.length;
  const safePage = Math.max(0, Math.min(page, total - 1));
  const item = items[safePage];

  const text = formatMyRequestPage(lang, item, safePage, total);
  const kb = myNavKeyboard(lang, safePage, total, item.request_id);

  if (edit) {
    try { return await ctx.editMessageText(text, kb); } catch { return ctx.reply(text, kb); }
  }
  return ctx.reply(text, kb);
}

// No-op for middle button / disabled arrows
bot.action("noop", async (ctx) => {
  await ctx.answerCbQuery();
});

// ---------------------- Bot Handlers ----------------------
bot.start(async (ctx) => {
  // keep existing lang if any, otherwise default
  const ses = s(ctx.chat.id);
  const lang = SUPPORTED_LANGS.includes(ses.lang) ? ses.lang : DEFAULT_LANG;

  resetFlow(ctx.chat.id);

  await ctx.reply(
    t(lang, "choose_lang_title"),
    Markup.inlineKeyboard([
      [Markup.button.callback(I18N.ru.lang_name, "set_lang:ru")],
      [Markup.button.callback(I18N.kk.lang_name, "set_lang:kk")],
      [Markup.button.callback(I18N.en.lang_name, "set_lang:en")]
    ])
  );
});

bot.action(/^my:page:(\d+)$/, async (ctx) => {
  await ctx.answerCbQuery();
  const lang = getLang(ctx);
  const page = Number(ctx.match[1] || "0");
  return renderMyRequests(ctx, lang, page, true);
});

bot.action(/^my:archive:([^:]+):(\d+)$/, async (ctx) => {
  await ctx.answerCbQuery();
  const lang = getLang(ctx);
  const requestId = ctx.match[1];
  const page = Number(ctx.match[2] || "0");
  const chatId = ctx.chat.id;

  try {
    const out = await archiveRequestViaWebApp(chatId, requestId);
    if (!out || !out.ok) {
      await ctx.reply(t(lang, "archived_err", { err: (out && out.error) || "UNKNOWN" }));
      return renderMyRequests(ctx, lang, page, true);
    }

    await ctx.reply(t(lang, "archived_ok"));

    // after deletion, refresh current page (may shift)
    return renderMyRequests(ctx, lang, page, true);
  } catch (e) {
    await ctx.reply(t(lang, "archived_err", { err: e.message }));
    return renderMyRequests(ctx, lang, page, true);
  }
});

bot.action(/^set_lang:(ru|kk|en)$/, async (ctx) => {
  await ctx.answerCbQuery();
  const lang = ctx.match[1];
  setLang(ctx.chat.id, lang);
  resetFlow(ctx.chat.id);

  await ctx.reply(t(lang, "lang_changed", { langName: I18N[lang].lang_name }));
  await ctx.reply(t(lang, "welcome"), menuKeyboard(lang));
});

bot.action("back_to_menu", async (ctx) => {
  await ctx.answerCbQuery();
  const lang = getLang(ctx);
  resetFlow(ctx.chat.id);
  await ctx.reply(t(lang, "menu_title"), menuKeyboard(lang));
});

bot.hears(anyLabel("menu_lang"), async (ctx) => {
  const lang = getLang(ctx);
  await ctx.reply(
    t(lang, "choose_lang_title"),
    Markup.inlineKeyboard([
      [Markup.button.callback(I18N.ru.lang_name, "set_lang:ru")],
      [Markup.button.callback(I18N.kk.lang_name, "set_lang:kk")],
      [Markup.button.callback(I18N.en.lang_name, "set_lang:en")]
    ])
  );
});

bot.hears(anyLabel("menu_new"), async (ctx) => {
  const lang = getLang(ctx);
  const ses = s(ctx.chat.id);
  ses.state = "await_description";
  ses.data = {};
  await ctx.reply(t(lang, "ask_description"));
});

bot.hears(anyLabel("menu_my"), async (ctx) => {
  const lang = getLang(ctx);
  return renderMyRequests(ctx, lang, 0, false); // always start from newest
});

bot.hears(anyLabel("menu_profile"), async (ctx) => {
  const lang = getLang(ctx);
  await ctx.reply(t(lang, "profile_text"));
});

bot.on("text", async (ctx) => {
  const lang = getLang(ctx);
  const ses = s(ctx.chat.id);
  const text = (ctx.message.text || "").trim();

  if (ses.state === "await_description") {
    if (!text) return ctx.reply(t(lang, "err_empty_description"));
    ses.data.description = text;
    ses.state = "await_location_choice";
    return ctx.reply(t(lang, "location_choice"), locationChoiceKeyboard(lang));
  }

  if (ses.state === "await_address") {
    if (!text) return ctx.reply(t(lang, "err_empty_address"));
    ses.data.address_text = text;
    ses.state = "await_photo";
    return ctx.reply(t(lang, "ask_photo"), skipPhotoKeyboard(lang));
  }

  // ignore other texts
});

bot.action("loc_geo", async (ctx) => {
  await ctx.answerCbQuery();
  const lang = getLang(ctx);
  const ses = s(ctx.chat.id);
  ses.state = "await_geo";
  await ctx.reply(t(lang, "ask_geo"));
});

bot.action("loc_addr", async (ctx) => {
  await ctx.answerCbQuery();
  const lang = getLang(ctx);
  const ses = s(ctx.chat.id);
  ses.state = "await_address";
  await ctx.reply(t(lang, "ask_addr"));
});

bot.on("location", async (ctx) => {
  const lang = getLang(ctx);
  const ses = s(ctx.chat.id);
  if (ses.state !== "await_geo") return;

  const { latitude, longitude } = ctx.message.location;
  ses.data.lat = latitude;
  ses.data.lng = longitude;

  ses.state = "await_photo";
  await ctx.reply(t(lang, "ask_photo"), skipPhotoKeyboard(lang));
});

bot.on("photo", async (ctx) => {
  const lang = getLang(ctx);
  const ses = s(ctx.chat.id);
  if (ses.state !== "await_photo") return;

  const photos = ctx.message.photo || [];
  const best = photos[photos.length - 1];
  ses.data.photo_file_id = best.file_id;

  ses.state = "await_confirm";
  await sendConfirm(ctx, lang, ses.data);
});

bot.action("skip_photo", async (ctx) => {
  await ctx.answerCbQuery();
  const lang = getLang(ctx);
  const ses = s(ctx.chat.id);
  if (ses.state !== "await_photo") return;

  ses.state = "await_confirm";
  await sendConfirm(ctx, lang, ses.data);
});

bot.action("cancel_request", async (ctx) => {
  await ctx.answerCbQuery();
  const lang = getLang(ctx);
  resetFlow(ctx.chat.id);
  await ctx.reply(t(lang, "cancelled"), menuKeyboard(lang));
});

bot.action("confirm_request", async (ctx) => {
  await ctx.answerCbQuery();
  const lang = getLang(ctx);
  const chatId = ctx.chat.id;
  const ses = s(chatId);

  if (!ses.data.description || !hasLocation(ses.data)) {
    resetFlow(chatId);
    return ctx.reply(t(lang, "err_need_desc_loc"), menuKeyboard(lang));
  }

  // Local fallback
  if (!WEBAPP_URL || !SHARED_SECRET) {
    const reqId = `SC-${String(Date.now()).slice(-6)}`;
    const item = {
      request_id: reqId,
      description: ses.data.description,
      status: "New",
      created_at: new Date().toISOString()
    };

    const arr = localStore.get(chatId) || [];
    arr.unshift(item);
    localStore.set(chatId, arr);

    resetFlow(chatId);
    return ctx.reply(t(lang, "accepted_local", { id: reqId }), menuKeyboard(lang));
  }

  try {
    const ai = await classifyIssue(ses.data.description);

    const payload = {
      secret: SHARED_SECRET,
      chat_id: chatId,
      telegram_user_id: ctx.from.id,
      user_name: ctx.from.first_name || "",
      description: ses.data.description,
      lat: ses.data.lat,
      lng: ses.data.lng,
      address_text: ses.data.address_text,
      photo_file_id: ses.data.photo_file_id,

      category: ai.category,
      priority: ai.priority,
      confidence: ai.confidence,
      tags: ai.tags,

      sheet_name: SHEET_NAME
    };

    const out = await createRequestViaWebApp(payload);

    resetFlow(chatId);

    if (out && out.ok) {
      return ctx.reply(t(lang, "sent_ok", { id: out.request_id }), menuKeyboard(lang));
    }

    return ctx.reply(t(lang, "send_error", { err: (out && out.error) || "UNKNOWN" }), menuKeyboard(lang));
  } catch (e) {
    resetFlow(chatId);
    return ctx.reply(t(lang, "conn_error", { err: e.message }), menuKeyboard(lang));
  }
});

// Start bot
bot.launch();
console.log("Bot started (long polling).");

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));