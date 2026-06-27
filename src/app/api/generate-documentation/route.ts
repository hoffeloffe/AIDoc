import { NextResponse } from 'next/server';
import { z } from 'zod';
import axios from 'axios';
import { detectLanguage } from '@/utils/languageDetection';
import { generateDocumentation as generateDocs } from '@/utils/codeHelper';
import codingStandards from '@/data/coding_standards.json';

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

const BodySchema = z.object({
  code: z.string().min(1, 'Code is required').max(100_000, 'Code too large'),
  language: z.string().optional(),
  apiKey: z.string().min(10).max(200),
  standards: z.string().max(10_000).optional(),
});

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10;
const RATE_WINDOW = 60_000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Too many requests. Try again in a minute.' },
      { status: 429 }
    );
  }

  const rawBody = await request.json().catch(() => null);
  const parsed = BodySchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request', details: parsed.error.issues },
      { status: 400 }
    );
  }
  const { code, language: clientLanguage, apiKey, standards: clientStandards } = parsed.data;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'API key is missing. Please add your API key in the settings.' },
      { status: 401 }
    );
  }

  const language = clientLanguage || detectLanguage(code);

  const standardsMap = codingStandards as Record<string, string[]>;
  const baseStandards = standardsMap[language] || standardsMap['general'] || [];
  const standards = clientStandards ? [...baseStandards, clientStandards] : baseStandards;

  try {
    const result = await generateDocs({
      code,
      language,
      apiKey,
      apiUrl: DEEPSEEK_API_URL,
      codingStandards: standards,
    });

    return NextResponse.json({
      documentation: result.documentation,
      improvedCode: result.improvedCode,
      originalCode: result.originalCode,
      language,
    });
  } catch (apiError: unknown) {
    const logMessage = apiError instanceof Error ? apiError.message : 'Unknown';
    console.error('DeepSeek API error:', logMessage);

    let statusCode = 500;
    let message = 'Documentation generation failed. Please try again.';

    if (axios.isAxiosError(apiError)) {
      const status = apiError.response?.status;
      if (status === 429) {
        statusCode = 429;
        message = 'Rate limited by AI provider. Please wait a moment.';
      } else if (status === 401) {
        statusCode = 401;
        message = 'Invalid API key.';
      }
    }

    return NextResponse.json({ error: message }, { status: statusCode });
  }
}
