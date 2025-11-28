import { GoogleGenAI, Type } from "@google/genai";
import { FormattedProfile, PROFILE_SCHEMA_PROPS } from "../types";

const SYSTEM_INSTRUCTION = `
You are an expert editor and resume analyst.
Your task is to extract structured biographical information from unstructured text.
Organize the data strictly into the following categories: Name, Titles, Education, Career, Research Direction, Main Topics, Teaching Style, Research Achievements, and Teaching Experience.
Refine the text to be professional, concise, and clean. If a specific category is missing in the text, return an empty array or empty string for that field. Do not makeup information.
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
    return JSON.parse(text) as FormattedProfile;
  } catch (e) {
    console.error("Failed to parse JSON", e);
    throw new Error("Failed to parse AI response");
  }
};