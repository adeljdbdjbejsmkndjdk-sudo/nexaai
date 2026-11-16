import express from "express";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();
const app = express();
app.use(express.json({ limit: "1mb" }));
app.use(express.static("."));

const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

const instructions = {
  writer: "اكتب محتوى عربيًا واضحًا ومنظمًا بعنوان ومقدمة وعناوين فرعية وخاتمة. لا تختلق حقائق أو أرقامًا.",
  summary: "لخّص النص المقدم في نقاط قصيرة، ثم اذكر أهم فكرة في سطر واحد.",
  ideas: "اقترح 10 أفكار عملية ومختلفة، واشرح كل فكرة في سطر.",
  social: "اكتب 3 صيغ لمنشور سوشيال ميديا: جذابة، قصيرة، وبها دعوة مناسبة لاتخاذ إجراء دون مبالغة.",
  translate: "ترجم النص ترجمة طبيعية وأمينة. إذا كان عربيًا فترجمه إلى الإنجليزية، وإذا كان إنجليزيًا فترجمه إلى العربية.",
  assistant: "أجب بدقة وبأسلوب ودود ومباشر. إذا لم تعرف معلومة فقل ذلك بوضوح."
};

app.post("/api/generate", async (req, res) => {
  try {
    if (!ai) return res.status(503).json({ error: "مفتاح Gemini غير مضبوط على الخادم بعد." });
    const { tool = "assistant", prompt, language = "Arabic" } = req.body || {};
    if (typeof prompt !== "string" || !prompt.trim()) {
      return res.status(400).json({ error: "اكتب طلبًا أولًا." });
    }
    const task = instructions[tool] || instructions.assistant;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `${task}\nلغة الإجابة: ${language}\n\nطلب المستخدم:\n${prompt.trim()}`
    });
    res.json({ text: response.text || "لم يتم إنشاء إجابة. حاول مرة أخرى." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "تعذر إنشاء الإجابة الآن. راجع إعداد الخادم وحاول مرة أخرى." });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`NexaAI running on http://localhost:${port}`));
