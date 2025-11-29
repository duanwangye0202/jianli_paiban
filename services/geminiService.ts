import { GoogleGenAI, Type } from "@google/genai";
import { FormattedProfile, PROFILE_SCHEMA_PROPS } from "../types";

const SYSTEM_INSTRUCTION = `
You are a precise document categorization engine.
Your task is to losslessly categorize content from the provided text into structured fields.

Categories:
1. Name (姓名)
2. Titles (职称头衔)
3. Career (从业经历)
4. Education (教育经历)
5. Research Direction (研究方向)
6. Main Topics (主讲课题)
7. Teaching Style (授课风格)
8. Research Achievements (研究成果)
9. Teaching Experience (授课经历) - Include specific teaching history, training experience. IMPORTANT: Any content related to "serving clients" (服务客户) or "serving enterprises" (服务企业) MUST be included in this category.
10. Other Content (其他内容) - ANYTHING that does not fit into categories 1-9 or 11.
11. Teaching Images (授课图片)

CRITICAL RULES:
1. PRESERVE CONTENT: Do not rewrite, summarize, or delete details. Extract the text exactly as found in the document. Do not "polish" the language unless correcting obvious scanning errors.
2. CATEGORIZE STRICTLY: Place content into the most appropriate category.
3. UNMATCHED CONTENT: If content does not fit specific categories, it MUST go into "Other Content". Do not discard any text.
4. MAIN TOPICS: Extract each topic as a separate string item.
`;

export const processProfileWithGemini = async (rawText: string): Promise<FormattedProfile> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: rawText,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: PROFILE_SCHEMA_PROPS,
        required: ["name"], // At minimum we need a name
      },
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("No response from AI");
  }

  try {
    const profile = JSON.parse(text) as FormattedProfile;

    // Post-processing to enforce specific formatting rules
    if (profile.topics && Array.isArray(profile.topics)) {
      profile.topics = profile.topics.map(t => {
        const topic = t.trim();
        // Rule: Add book title marks 《》 if not present
        if (topic.length > 0 && !(topic.startsWith('《') && topic.endsWith('》'))) {
           return `《${topic}》`;
        }
        return topic;
      });
    }

    return profile;
  } catch (e) {
    console.error("Failed to parse JSON", e);
    throw new Error("Failed to parse AI response");
  }
};