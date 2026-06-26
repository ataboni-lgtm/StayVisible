import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { routeHandler } from '@/lib/route-handler/route-handler';
import { ZodValidationError } from '@/lib/route-handler/next-errors';
import { emptyVoiceProfile } from '@/lib/stay-visible/demo-data';
import { clientDisplayName } from '@/lib/stay-visible/client-display';
import { readStore, saveGeneratedPosts } from '@/lib/stay-visible/local-store';

const zGeneratePostsInput = z.object({ clientId: z.string().min(1), postType: z.string().min(1), topic: z.string().min(1), date: z.string().optional(), location: z.string().optional(), mentions: z.string().optional(), mainTakeaway: z.string().min(1), notes: z.string().optional(), tone: z.string().optional(), callToAction: z.string().optional(), photoContext: z.string().optional() });

export const POST = routeHandler(async (request: NextRequest) => {
  // Authentication: Production deployments should require a Supabase admin session.
  // Authorization: Only the admin who owns the client may generate content.
  // Input validation
  const parsed = zGeneratePostsInput.safeParse(await request.json());
  if (!parsed.success) return ZodValidationError(parsed.error);
  // Processing the request
  const input = parsed.data; const data = await readStore(); const client = data.clients.find((item) => item.id === input.clientId); const voiceProfile = data.voiceProfiles[input.clientId] ?? emptyVoiceProfile;
  let options = demoOptions(input.topic, input.mainTakeaway);
  if (process.env.OPENAI_API_KEY) { const response = await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST', headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model: 'gpt-4.1-mini', response_format: { type: 'json_object' }, temperature: 0.8, messages: [
    { role: 'system', content: `You write LinkedIn posts in the client's actual voice. Return JSON: {"options":[{"label":"Short and direct","content":"..."},{"label":"Personal takeaway","content":"..."},{"label":"Professional recap","content":"..."}]}. Never use em dashes. Do not sound overly polished. Avoid corporate jargon and generic phrases including excited to share, honored to attend, valuable insights, great connections, and inspiring discussion unless explicitly supported by the voice profile. Use natural rhythm, readable spacing, restrained hashtags, and emojis only when allowed.` },
    { role: 'user', content: JSON.stringify({ client: client ? clientDisplayName(client) : 'Client', voiceProfile: voiceProfile, opportunity: input }) },
  ] }) }); if (!response.ok) throw new Error(`OpenAI request failed: ${response.status}`); const result = await response.json() as { choices?: Array<{ message: { content?: string } }> }; const content = result.choices?.[0]?.message.content ?? '{}'; options = (JSON.parse(content) as { options?: Array<{ label: string; content: string }> }).options ?? options; }
  const saved = await saveGeneratedPosts({ clientId: input.clientId, postType: input.postType, topic: input.topic, date: input.date, location: input.location, mentions: input.mentions, mainTakeaway: input.mainTakeaway, notes: input.notes, tone: input.tone, callToAction: input.callToAction, photoContext: input.photoContext }, options);
  return NextResponse.json({ options: options.map((option, index) => ({ ...option, postId: saved.posts[index]?.id })), opportunityId: saved.opportunity.id });
});

function demoOptions(topic: string, takeaway: string) { return [
  { label: 'Short and direct', content: `${takeaway}\n\nThat was the clearest lesson from ${topic}.` },
  { label: 'Personal takeaway', content: `What stayed with me after ${topic}:\n\n${takeaway}\n\nSimple, but useful.` },
  { label: 'Professional recap', content: `${topic} was a good reminder that the most useful conversations are usually the most practical.\n\n${takeaway}\n\nThat is the idea I am taking into this week.` },
]; }
