import { GoogleGenAI } from "@google/genai";
import { StyleOption } from "../types";

const processEnvApiKey = process.env.API_KEY;

if (!processEnvApiKey) {
  console.error("API_KEY is missing from environment variables.");
}

const ai = new GoogleGenAI({ apiKey: processEnvApiKey || '' });

export const generateSticker = async (
  imageBase64: string,
  style: StyleOption
): Promise<string> => {
  try {
    // Clean base64 string if it has prefix
    const base64Data = imageBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");
    
    // Construct the prompt using the Optimized Prompt Formula
    // We rely on style.prompt which remains hardcoded in English in STYLES constants for best AI performance
    const prompt = `${style.prompt}, a sticker of the person from the provided isolated image, expressive pose, detailed facial features, transformed into vector art, with a thick white die-cut border, on a transparent background`;

    // Using gemini-2.5-flash-image for image editing/transformation tasks
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: prompt
          },
          {
            inlineData: {
              mimeType: 'image/jpeg', // Assuming JPEG for input or generally compatible type
              data: base64Data
            }
          }
        ]
      },
    });

    // Check for candidates
    const parts = response.candidates?.[0]?.content?.parts;
    
    if (!parts) {
      throw new Error("No content generated.");
    }

    // Find the image part
    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    
    throw new Error("No image data found in response.");

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
