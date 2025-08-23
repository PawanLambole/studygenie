
import { GoogleGenAI, Type, Chat } from "@google/genai";
import type { StudyMaterials, ChatMessage } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY is not set. Please set the API_KEY environment variable.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const studyMaterialSchema = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.STRING,
      description: "A concise summary of the provided text, capturing the main points.",
    },
    flashcards: {
      type: Type.ARRAY,
      description: "A list of flashcards with a question and a corresponding answer.",
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          answer: { type: Type.STRING },
        },
        required: ["question", "answer"],
      },
    },
    quiz: {
      type: Type.ARRAY,
      description: "A list of multiple-choice questions based on the text.",
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          options: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "An array of 4 possible answers.",
          },
          correctAnswer: {
            type: Type.STRING,
            description: "The correct answer from the options array.",
          },
        },
        required: ["question", "options", "correctAnswer"],
      },
    },
    topics: {
      type: Type.ARRAY,
      description: "A list of 1-3 main topics or subjects covered in the text.",
      items: { type: Type.STRING },
    },
  },
  required: ["summary", "flashcards", "quiz", "topics"],
};

export async function generateStudyMaterials(text: string): Promise<StudyMaterials> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Based on the following text, generate a comprehensive study guide. Create a summary, at least 5 flashcards, and a 5-question multiple-choice quiz. Identify the main topics. Text: """${text}"""`,
      config: {
        responseMimeType: "application/json",
        responseSchema: studyMaterialSchema,
      },
    });

    const jsonText = response.text.trim();
    // Gemini may wrap JSON in markdown, so we need to clean it
    const cleanedJson = jsonText.replace(/^```json\s*|```\s*$/g, '');
    const parsedData = JSON.parse(cleanedJson);

    // Basic validation
    if (!parsedData.summary || !parsedData.flashcards || !parsedData.quiz || !parsedData.topics) {
        throw new Error("Received incomplete study materials from AI.");
    }

    return parsedData as StudyMaterials;

  } catch (error) {
    console.error("Error generating study materials:", error);
    throw new Error("Failed to generate study materials. The AI might be unavailable or the input text could be too complex. Please try again.");
  }
}

const fileToBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = error => reject(error);
});


export async function extractTextFromImage(file: File): Promise<string> {
    if (!file.type.startsWith('image/')) {
        throw new Error('File is not an image.');
    }

    const base64Data = await fileToBase64(file);

    const imagePart = {
        inlineData: {
            mimeType: file.type,
            data: base64Data,
        },
    };

    const textPart = {
        text: 'Perform OCR on this image. It could be handwritten notes, a textbook page, or a presentation slide. Extract all text content accurately and structure it logically.'
    };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
        });
        return response.text;
    } catch (error) {
        console.error("Error extracting text from image:", error);
        throw new Error("Failed to extract text from the image using AI. Please try again.");
    }
}


export async function translateText(text: string, targetLanguage: string): Promise<string> {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Translate the following text into ${targetLanguage}: "${text}"`,
        });
        return response.text;
    } catch (error) {
        console.error("Error translating text:", error);
        throw new Error("Failed to translate the text.");
    }
}


let chatInstance: Chat | null = null;

export function initializeTutorChat(sourceText: string): void {
    chatInstance = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: `You are a helpful AI tutor. Your role is to answer questions based *only* on the provided study material. Do not use any external knowledge. If the answer to a question cannot be found in the material, you must state that you cannot answer based on the provided context. Here is the study material: """${sourceText}"""`,
        },
    });
}

export async function* getTutorResponseStream(message: string) {
    if (!chatInstance) {
        throw new Error("Tutor chat is not initialized. Please provide study material first.");
    }
    
    const responseStream = await chatInstance.sendMessageStream({ message });
    for await (const chunk of responseStream) {
        yield chunk.text;
    }
}