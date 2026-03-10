import { NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';

export const runtime = 'nodejs';

const MODEL = 'gemini-3-flash-preview';

const scenarios = {
  general: {
    prompt: 'Generate a short multiple-choice cybersecurity scenario. Return JSON with: title, description, options (array of 4 objects with id, text, isCorrect, feedback).',
    schema: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        description: { type: Type.STRING },
        options: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              text: { type: Type.STRING },
              isCorrect: { type: Type.BOOLEAN },
              feedback: { type: Type.STRING },
            },
            required: ['id', 'text', 'isCorrect', 'feedback'],
          },
        },
      },
      required: ['title', 'description', 'options'],
    },
  },
  phishing: {
    prompt: `Generate a short, realistic email or SMS scenario for a consumer.
CRITICAL: Randomly choose between:
1. A clear phishing scam.
2. A TRICKY LEGITIMATE message that looks suspicious (e.g., weird automated alert, poorly formatted corporate email, legitimate password reset) but is actually safe.

Return JSON with: type ('email' or 'sms'), sender, subject (if email), content, isPhishing (boolean), redFlags (array of strings if phishing, empty if safe), explanation (explain why it's safe or a scam, especially if it's a tricky legitimate one).`,
    schema: {
      type: Type.OBJECT,
      properties: {
        type: { type: Type.STRING },
        sender: { type: Type.STRING },
        subject: { type: Type.STRING },
        content: { type: Type.STRING },
        isPhishing: { type: Type.BOOLEAN },
        redFlags: { type: Type.ARRAY, items: { type: Type.STRING } },
        explanation: { type: Type.STRING },
      },
      required: ['type', 'sender', 'content', 'isPhishing', 'redFlags', 'explanation'],
    },
  },
  'secure-coding': {
    prompt: 'Generate a short secure coding challenge based on OWASP Top 10. Return JSON with: title, description, language, vulnerableCode, vulnerabilityType, options (array of 3 objects with id, code, isCorrect, explanation).',
    schema: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        description: { type: Type.STRING },
        language: { type: Type.STRING },
        vulnerableCode: { type: Type.STRING },
        vulnerabilityType: { type: Type.STRING },
        options: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              code: { type: Type.STRING },
              isCorrect: { type: Type.BOOLEAN },
              explanation: { type: Type.STRING },
            },
            required: ['id', 'code', 'isCorrect', 'explanation'],
          },
        },
      },
      required: ['title', 'description', 'language', 'vulnerableCode', 'vulnerabilityType', 'options'],
    },
  },
  privacy: {
    prompt: 'Generate 5 data items for a classification exercise. Return JSON with: items (array of objects with id, name, description, classification (Public, Internal, Confidential, Restricted), explanation).',
    schema: {
      type: Type.OBJECT,
      properties: {
        items: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING },
              description: { type: Type.STRING },
              classification: { type: Type.STRING },
              explanation: { type: Type.STRING },
            },
            required: ['id', 'name', 'description', 'classification', 'explanation'],
          },
        },
      },
      required: ['items'],
    },
  },
  'watering-hole': {
    prompt: `Generate a short website scenario.
CRITICAL: Randomly choose between:
1. A compromised watering hole website.
2. A TRICKY SAFE website that looks suspicious (e.g., outdated HTTP, weird domain for a legitimate local business, messy code) but is actually NOT malicious.

Return JSON with: websiteName, url, description, isCompromised (boolean), indicators (array of strings if compromised, empty if safe), explanation (explain why it's compromised or safe, especially if it's a tricky safe one), htmlSnippet.`,
    schema: {
      type: Type.OBJECT,
      properties: {
        websiteName: { type: Type.STRING },
        url: { type: Type.STRING },
        description: { type: Type.STRING },
        isCompromised: { type: Type.BOOLEAN },
        indicators: { type: Type.ARRAY, items: { type: Type.STRING } },
        explanation: { type: Type.STRING },
        htmlSnippet: { type: Type.STRING },
      },
      required: ['websiteName', 'url', 'description', 'isCompromised', 'indicators', 'explanation', 'htmlSnippet'],
    },
  },
} as const;

export async function POST(req: Request) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: 'GEMINI_API_KEY is not set' }, { status: 500 });
  }

  const body = await req.json().catch(() => ({}));
  const kind = body?.kind as keyof typeof scenarios | undefined;
  const scenario = kind ? scenarios[kind] : undefined;

  if (!scenario) {
    return NextResponse.json({ error: 'Invalid scenario kind' }, { status: 400 });
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: scenario.prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: scenario.schema,
    },
  });

  const text = response.text || '{}';
  try {
    return NextResponse.json(JSON.parse(text));
  } catch {
    return NextResponse.json({ error: 'Invalid model response', raw: text }, { status: 502 });
  }
}
