import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ParsedOfferData } from '../types';

const getAiClient = () => {
  // Ideally handled via proxy, but for this demo utilizing env var directly
  // NOTE: In production, do not expose API keys in frontend code.
  if (!process.env.API_KEY) {
    console.error("API_KEY is missing!");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
};

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    studentName: { type: Type.STRING, description: "Full name of the student found in the document." },
    university: { type: Type.STRING, description: "Name of the university issuing the offer." },
    program: { type: Type.STRING, description: "The specific degree or program name (e.g., MSc Computer Science)." },
    offerType: { 
      type: Type.STRING, 
      enum: ["Conditional", "Unconditional", "Reject", "Waitlist"],
      description: "The classification of the offer status. Map Chinese terms (e.g. '有条件录取') to 'Conditional', '无条件' to 'Unconditional', etc."
    },
    conditions: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "List of specific conditions (e.g., 'IELTS 7.0', 'Final GPA 80%'). Null if unconditional or reject."
    },
    depositAmount: { type: Type.STRING, description: "The amount of deposit required, including currency symbol (e.g., £2000)." },
    depositDeadline: { type: Type.STRING, description: "The deadline date for the deposit payment (ISO format YYYY-MM-DD preferred, or original string)." },
    startTerm: { type: Type.STRING, description: "The intake or start term (e.g., September 2024)." },
    offerDate: { type: Type.STRING, description: "Date the letter was issued (ISO format YYYY-MM-DD)." },
    schoolId: { type: Type.STRING, description: "Student ID or Application ID assigned by the school." },
    nextSteps: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "Actionable next steps required from the student."
    },
    keySentences: { type: Type.STRING, description: "A short excerpt or summary of the key sentence confirming the offer status for verification." },
  },
  required: ["university", "offerType"],
};

export const parseOfferFile = async (file: File): Promise<ParsedOfferData> => {
  const ai = getAiClient();
  const model = "gemini-2.5-flash"; // Efficient for text/document tasks

  // Convert File to Base64
  const base64Data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove Data URL prefix (e.g., "data:application/pdf;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const mimeType = file.type;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          },
          {
            text: `You are an expert university admissions officer assistant. 
            Analyze this document (which may be a PDF offer letter, a scanned image, or an email screenshot).
            The document may be in English or Chinese.
            Extract the structured data strictly according to the JSON schema provided.
            
            IMPORTANT:
            1. If a field is not present, return null. 
            2. For 'offerType', strictly map the status to one of the enum values: "Conditional", "Unconditional", "Reject", "Waitlist".
            3. Format dates as YYYY-MM-DD if possible.
            4. Keep the conditions and next steps in their original language (or English if preferred for standardisation).`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.1, // Low temperature for high accuracy extraction
      }
    });

    const text = response.text;
    if (!text) throw new Error("AI 未返回任何内容");
    
    return JSON.parse(text) as ParsedOfferData;

  } catch (error) {
    console.error("Gemini Parsing Error:", error);
    throw new Error("无法使用 Gemini AI 解析该文档，请检查网络或 API Key。");
  }
};