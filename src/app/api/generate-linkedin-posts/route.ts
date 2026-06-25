import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { routeHandler } from '@/lib/route-handler/route-handler';
import { ZodValidationError } from '@/lib/route-handler/next-errors';
import { emptyVoiceProfile, getClient } from '@/lib/stay-visible/demo-data';

const zGeneratePostsInput = z.object({ clientId: z.string().min(1), postType: z.string().min(1), topic: z.string().min(1), date: z.string().optional(), location: z.string().optional(), mentions: z.string().optional(), mainTakeaway: z.string().min(1), notes: z.string().optional(), tone: z.string().optional(), callToAction: z.string().optional(), photoContext: z.string().optional() });

export const POST = routeHandler(async (request: NextRequest) => {
  // Authentication: Production deployments should require a Supabase admin session.
  // Authorization: Only the admin who owns the client may generate content.
  // Input validation
  const parsed = zGeneratePostsInput.safeParse(await request.json());
  if (!parsed.success) return ZodValidationError(parsed.error);
  // Processing the request
  const input = parsed.data; const client = getClient(input.clientId);
  if (!process.env.OPENAI_API_KEY) return NextResponse.json({ options: demoOptions(input.topic, input.mainTakeaway) });
  const response = await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST', headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model: 'gpt-4.1-mini', response_format: { type: 'json_object' }, temperature: 0.8, messages: [
    { role: 'system', content: `You write LinkedIn posts in the client's actual voice. Return JSON: {"options":[{"label":"Short and direct","content":"..."},{"label":"Personal takeaway","content":"..."},{"label":"Professional recap","content":"..."}]}. Never use em dashes. Do not sound overly polished. Avoid corporate jargon and generic phrases including excited to share, honored to attend, valuable insights, great connections, and inspiring discussion unless explicitly supported by the voice profile. Use natural rhythm, readable spacing, restrained hashtags, and emojis only when allowed.` },
    { role: 'user', content: JSON.stringify({ client: client ? `${client.firstName} ${client.lastName}` : 'Client', voiceProfile: emptyVoiceProfile, opportunity: input }) },
  ] }) });
  if (!response.ok) throw new Error(`OpenAI request failed: ${response.status}`);
  const result = await response.json() as { choices?: Array<{ message: { content?: string } }> };
  const content = result.choices?.[0]?.message.content ?? '{}';
  return NextResponse.json(JSON.parse(content));
});

function demoOptions(topic: string, takeaway: string) { return [
  { label: 'Short and direct', content: `${takeaway}\n\nThat was the clearest lesson from ${topic}.` },
  { label: 'Personal takeaway', content: `What stayed with me after ${topic}:\n\n${takeaway}\n\nSimple, but useful.` },
  { label: 'Professional recap', content: `${topic} was a good reminder that the most useful conversations are usually the most practical.\n\n${takeaway}\n\nThat is the idea I am taking into this week.` },
]; }
