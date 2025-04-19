import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { getWriteWithMePrompt } from '@/app/constants/prompt';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error('Missing API Key in environment');
}

export async function POST(req: Request) {
  try {
    const { input } = await req.json();

    if (!input || typeof input !== 'string') {
      return NextResponse.json(
        { error: "Missing or invalid 'input' in request body." },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenAI({ apiKey });
    const prompt = getWriteWithMePrompt(input);

    const result = await genAI.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    const raw = result?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim());

    return NextResponse.json({ suggestion: parsed.suggestion });
  } catch (err: any) {
    console.error('Suggest API error:', err);
    return NextResponse.json(
      { error: err.message || 'Something went wrong.' },
      { status: 500 }
    );
  }
}
