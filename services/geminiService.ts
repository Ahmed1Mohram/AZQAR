import { GoogleGenAI } from "@google/genai";

// Note: In a real production app, this call should go through a backend proxy
// to protect the API key. For this demo, we assume the environment variable is set.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const explainDhikr = async (dhikrText: string): Promise<string> => {
  if (!process.env.API_KEY) {
      return "عذراً، خدمة الذكاء الاصطناعي غير متوفرة حالياً (مفتاح API مفقود).";
  }

  try {
    const model = 'gemini-2.5-flash';
    const prompt = `
      أنت مساعد إسلامي عالم. اشرح لي فضل ومعنى هذا الذكر باختصار وجمال:
      "${dhikrText}"
      
      اجعل الرد موجزاً وملهماً باللغة العربية.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text || "لم أتمكن من الحصول على شرح في الوقت الحالي.";
  } catch (error) {
    console.error("Error explaining dhikr:", error);
    return "حدث خطأ أثناء محاولة شرح الذكر.";
  }
};