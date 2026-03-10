import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export const runtime = 'nodejs';

const MODEL = 'gemini-3-flash-preview';
const SYSTEM_INSTRUCTION = 'You are simulating a CEO trying to commit executive fraud via chat. Keep responses short (1-2 sentences). Urgently ask the user to wire $50k to a new vendor. If they agree, say exactly "[FAILED] Money sent. You were scammed." If they insist on verifying, say exactly "[PASSED] Good job following protocol."';

type ChatMessage = { role: 'user' | 'model' | 'system'; content: string };

export async function POST(req: Request) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: 'GEMINI_API_KEY is not set' }, { status: 500 });
  }

  const body = await req.json().catch(() => ({}));
  const messages = Array.isArray(body?.messages) ? (body.messages as ChatMessage[]) : [];

  const contents = messages
    .filter((msg) => msg && msg.role !== 'system' && typeof msg.content === 'string')
    .map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

  if (contents.length === 0) {
    return NextResponse.json({ error: 'No messages provided' }, { status: 400 });
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const response = await ai.models.generateContent({
    model: MODEL,
    contents,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
    },
  });

  return NextResponse.json({ text: response.text || '' });
}
