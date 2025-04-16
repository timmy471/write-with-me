import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

interface Suggestion {
  text: string;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const text = searchParams.get("text");

  if (!text) {
    return NextResponse.json(
      { error: "Missing text parameter" },
      { status: 400 }
    );
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing Gemini API Key" },
      { status: 500 }
    );
  }

  const genAI = new GoogleGenAI({ apiKey });

  try {
    const prompt = `You are an autocomplete assistant. Based on the phrase: "${text}", suggest 5 likely word completions as JSON array with "text" keys. Respond with only the array.`;

    const result = await genAI.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const rawText = result?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const cleaned = rawText.replace(/```json|```/g, "").trim();
    const suggestions: Suggestion[] = JSON.parse(cleaned);

    return NextResponse.json({ suggestions });
  } catch (error: any) {
    console.error("Gemini API error:", error);
    return NextResponse.json(
      { error: error.message || "Error generating suggestions" },
      { status: 500 }
    );
  }
}
