// bot/src/classifier.js
require("dotenv").config();

const AI_ENABLED = String(process.env.AI_ENABLED || "false").toLowerCase() === "true";
const OPENAI_API_KEY = (process.env.OPENAI_API_KEY || "").trim();
const OPENAI_MODEL = (process.env.OPENAI_MODEL || "gpt-4o-mini").trim();
const CONF_THRESH = Number(process.env.AI_CONFIDENCE_THRESHOLD || 0.6);

const CATEGORIES = ["Roads", "Lighting", "Trash", "Utilities", "Safety", "Unsorted"];
const PRIORITIES = ["Low", "Medium", "High"];

function ruleBasedClassify(textRaw) {
  const text = (textRaw || "").toLowerCase();

  const tags = [];
  let category = "Unsorted";
  let priority = "Medium";
  let confidence = 0.45;

  const has = (...words) => words.some((w) => text.includes(w));

  if (has("яма", "выбои", "асфальт", "дорог", "трещин", "колея", "провал", "бордюр", "тротуар")) {
    category = "Roads";
    confidence = 0.75;
    tags.push("road");
  } else if (has("фонарь", "свет", "освещ", "ламп", "не горит", "мигает")) {
    category = "Lighting";
    confidence = 0.75;
    tags.push("lighting");
  } else if (has("мусор", "контейнер", "свалк", "пакет", "грязь")) {
    category = "Trash";
    confidence = 0.75;
    tags.push("trash");
  } else if (has("вода", "канализа", "теч", "прорв", "тепло", "отоплен", "газ", "труба")) {
    category = "Utilities";
    confidence = 0.7;
    tags.push("utilities");
  }

  // Low priority heuristics (non-urgent / cosmetic / informational)
  // Explicit keywords to make testing easy:
  const explicitLow =
    text.includes("low priority") ||
    text.includes("priority low") ||
    text.includes("низкий приоритет") ||
    text.includes("несрочно") ||
    text.includes("не срочно") ||
    text.includes("по возможности") ||
    text.includes("не критично");

  // Typical low-urgency issues (cosmetic / minor):
  const lowIssue =
    has("граффити", "надпись", "наклейк", "листовк", "объявлен") ||
    has("покрас", "краска", "эстетик", "космет") ||
    has("мелк", "чуть-чуть", "немного") ||
    has("убрать", "подмести") && has("мусор", "бумажк") ||
    has("табличк", "указател");

  // Apply Low only if no danger keywords are present later
  if (explicitLow || lowIssue) {
    priority = "Low";
    confidence = Math.max(confidence, 0.65);
    tags.push("non-urgent");
  }

  // Safety / urgency
  if (has("искрит", "огол", "опасно", "обрыв", "авар", "открыт", "люк", "пожар", "взрыв")) {
    priority = "High";
    confidence = Math.max(confidence, 0.8);
    tags.push("danger");
    if (category === "Unsorted") category = "Safety";
  }

  if (!CATEGORIES.includes(category)) category = "Unsorted";
  if (!PRIORITIES.includes(priority)) priority = "Medium";
  const tagsStr = tags.slice(0, 6).join(";");

  if (confidence < CONF_THRESH) category = "Unsorted";

  return { category, priority, confidence, tags: tagsStr };
}

async function openAIClassify(textRaw) {
  const OpenAI = (await import("openai")).default;
  const client = new OpenAI({ apiKey: OPENAI_API_KEY });

  const schema = {
    type: "object",
    additionalProperties: false,
    properties: {
      category: { type: "string", enum: CATEGORIES },
      priority: { type: "string", enum: PRIORITIES },
      confidence: { type: "number", minimum: 0, maximum: 1 },
      tags: { type: "array", items: { type: "string" }, maxItems: 6 }
    },
    required: ["category", "priority", "confidence", "tags"]
  };

  const instructions =
    "Classify a Kazakhstan city-issue report. Return ONLY JSON matching the schema. " +
    "Categories: Roads (potholes/asphalt/sidewalk), Lighting (street lights), Trash (garbage/containers), Utilities (water/sewage/heating/gas), Safety (hazards: sparks/open manhole/wires), Unsorted (unclear). " +
    "Priority rules: " +
    "High = dangerous/urgent (sparks, open manhole, exposed wires, flooding, gas leak, risk of injury). " +
    "Low = non-urgent / cosmetic / minor (graffiti, stickers, posters, minor cleanup, faded signs, aesthetic improvements). " +
    "Medium = everything else. " +
    "Confidence: 0..1. Use lower confidence if ambiguous. " +
    "Tags: short English keywords. " +
    "Examples: " +
    "Text: 'Несрочно: граффити на стене, по возможности закрасить' => priority Low, category Unsorted or Trash, confidence ~0.7. " +
    "Text: 'Не горит фонарь возле дома' => category Lighting, priority Medium. " +
    "Text: 'Искрит провод, опасно' => category Safety, priority High. " +
    "Text: 'Низкий приоритет: наклейки на остановке' => priority Low, category Trash or Unsorted. ";

  const resp = await client.responses.create({
    model: OPENAI_MODEL,
    instructions,
    input: String(textRaw || ""),
    text: { format: { type: "json_schema", strict: true, schema } }
  });

  const obj = JSON.parse(resp.output_text);

  let category = CATEGORIES.includes(obj.category) ? obj.category : "Unsorted";
  let priority = PRIORITIES.includes(obj.priority) ? obj.priority : "Medium";
  let confidence = Number(obj.confidence);
  if (!Number.isFinite(confidence)) confidence = 0.4;

  const tagsArr = Array.isArray(obj.tags) ? obj.tags : [];
  const tags = tagsArr.map((t) => String(t).trim()).filter(Boolean).slice(0, 6).join(";");

  if (confidence < CONF_THRESH) category = "Unsorted";

  return { category, priority, confidence, tags };
}

async function classifyIssue(description) {
  if (!AI_ENABLED || !OPENAI_API_KEY) return ruleBasedClassify(description);
  try {
    return await openAIClassify(description);
  } catch {
    return ruleBasedClassify(description);
  }
}

module.exports = { classifyIssue };