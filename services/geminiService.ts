
import { GoogleGenAI, Type } from "@google/genai";
import { QuestionResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const OCR_SYSTEM_PROMPT = `
You are a highly accurate OCR system specialized in handwritten exam papers.
Your goal is to extract text from an image of a handwritten response.

Follow these strict rules:
1. QUESTION SEGMENTATION: Identify the boundaries between different questions (e.g., Q1, Q2, Question 1) and group the text accordingly.
2. PRESERVE SPELLING: Do NOT correct any spelling mistakes or grammatical errors. Transcribe them exactly as written.
3. HANDLE CANCELLATIONS: If text is clearly crossed out (stricken through), do NOT include it in the transcription.
4. MANAGE INSERTIONS: If there are arrows pointing to insertions or text written above lines with carets, integrate them into the correct semantic flow of the sentence.
5. NO HALLUCINATION: If a word is illegible, use "[unclear]".

Return the output strictly in the requested JSON format.
`;

export async function processHandwritingImage(base64Image: string): Promise<QuestionResponse[]> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        {
          parts: [
            { text: OCR_SYSTEM_PROMPT },
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: base64Image
              }
            }
          ]
        }
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            responses: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  questionNumber: { type: Type.STRING, description: "The label of the question (e.g. Q1)" },
                  originalText: { type: Type.STRING, description: "The verbatim transcribed text" },
                  confidence: { type: Type.NUMBER, description: "Confidence score from 0 to 1" }
                },
                required: ["questionNumber", "originalText", "confidence"]
              }
            }
          },
          required: ["responses"]
        }
      }
    });

    const result = JSON.parse(response.text || '{"responses": []}');
    return result.responses;
  } catch (error) {
    console.error("OCR API Error:", error);
    throw new Error("Failed to process the image with Gemini.");
  }
}
