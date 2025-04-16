import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

interface Suggestion {
  text: string;
}

export async function POST(req: Request) {
  try {
    const { input } = await req.json();

    if (!input || typeof input !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'input' in request body." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing Gemini API key in environment." },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenAI({ apiKey });

    const prompt = `You're an autocomplete assistant.

            Based on the phrase: "${input}", suggest **one** likely and most accurate continuation — no more than 5 words.

            Rules:
            - If the last word in the phrase is incomplete, complete it without adding a leading space.
            - If the last word is complete, continue with the next likely word(s) and prefix with a leading space. This is compulsory, be sure to adhere.
            - If the input doesn't make sense or seems like jargon or gibberish, return { "suggestion": "" }.

            Example 1:
            - Input: "I am going to the"
            - Response: { "suggestion": " store" }

            Example 2:
            - Input: "I am going to the stor"
            - Response: { "suggestion": "e" }

            Your response should be a plain JSON object like: { "suggestion": "..." } — no explanation, no extra characters.`;

    const result = await genAI.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const raw = result?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());

    if (!parsed?.suggestion) {
      throw new Error("Invalid suggestion format from Gemini.");
    }

    return NextResponse.json({ suggestion: parsed.suggestion });
  } catch (err: any) {
    console.error("Suggest API error:", err);
    return NextResponse.json(
      { error: err.message || "Something went wrong." },
      { status: 500 }
    );
  }
}
