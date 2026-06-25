import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { routeHandler } from '@/lib/route-handler/route-handler';
import { ZodValidationError } from '@/lib/route-handler/next-errors';

const zCheckWritingInput = z.object({
  text: z.string().min(1),
  context: z.string().optional().default('LinkedIn caption'),
});

export const POST = routeHandler(async (request: NextRequest) => {
  const parsed = zCheckWritingInput.safeParse(await request.json());
  if (!parsed.success) return ZodValidationError(parsed.error);

  const { text, context } = parsed.data;
  let checkedText = basicWritingCheck(text);

  if (process.env.OPENAI_API_KEY) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        temperature: 0.1,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: 'You are a careful spelling and grammar editor. Return JSON: {"checkedText":"..."}. Fix spelling, typos, punctuation, and grammar only. Preserve the writer voice, paragraph breaks, meaning, hashtags, mentions, and natural rhythm. Do not make the text more corporate. Do not add emojis. Do not add em dashes.',
          },
          {
            role: 'user',
            content: JSON.stringify({ context, text }),
          },
        ],
      }),
    });
    if (!response.ok) throw new Error(`OpenAI request failed: ${response.status}`);
    const result = await response.json() as { choices?: Array<{ message: { content?: string } }> };
    const content = result.choices?.[0]?.message.content ?? '{}';
    checkedText = (JSON.parse(content) as { checkedText?: string }).checkedText ?? checkedText;
  }

  return NextResponse.json({
    checkedText,
    changed: checkedText !== text,
  });
});

function basicWritingCheck(text: string) {
  const replacements: Array<[RegExp, string]> = [
    [/\bimput\b/gi, 'input'],
    [/\bgrammer\b/gi, 'grammar'],
    [/\bgrfammer\b/gi, 'grammar'],
    [/\brecieve\b/gi, 'receive'],
    [/\bseperate\b/gi, 'separate'],
    [/\bdefinately\b/gi, 'definitely'],
    [/\boccured\b/gi, 'occurred'],
    [/\bteh\b/gi, 'the'],
    [/\btheir is\b/gi, 'there is'],
    [/\btheir are\b/gi, 'there are'],
    [/\bi\b/g, 'I'],
  ];

  return replacements
    .reduce((value, [pattern, replacement]) => value.replace(pattern, replacement), text)
    .replace(/[ \t]+$/gm, '')
    .replace(/\s+([,.!?;:])/g, '$1')
    .replace(/([.!?]) {2,}/g, '$1 ')
    .trim();
}
