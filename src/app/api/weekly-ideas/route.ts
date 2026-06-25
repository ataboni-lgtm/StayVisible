import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { routeHandler } from '@/lib/route-handler/route-handler';
import { ZodValidationError } from '@/lib/route-handler/next-errors';
import { readStore, saveWeeklyIdeas } from '@/lib/stay-visible/local-store';

const zWeeklyIdeasInput = z.object({
  clientId: z.string().min(1),
  recentActivityNotes: z.string().optional().default(''),
});

export const POST = routeHandler(async (request: NextRequest) => {
  const parsed = zWeeklyIdeasInput.safeParse(await request.json());
  if (!parsed.success) return ZodValidationError(parsed.error);

  const data = await readStore();
  const client = data.clients.find((item) => item.id === parsed.data.clientId);
  if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 });

  const pastPosts = data.posts.filter((post) => post.clientId === client.id).slice(0, 5);
  let ideas = fallbackIdeas(client, parsed.data.recentActivityNotes);

  if (process.env.OPENAI_API_KEY) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        response_format: { type: 'json_object' },
        temperature: 0.75,
        messages: [
          { role: 'system', content: 'Generate 3 practical LinkedIn post ideas for one professional. Return JSON: {"ideas":[{"topic":"...","reason":"...","angle":"..."}]}. Keep ideas concrete, useful, and natural. No em dashes.' },
          { role: 'user', content: JSON.stringify({ client, recentActivityNotes: parsed.data.recentActivityNotes, pastPosts }) },
        ],
      }),
    });
    if (!response.ok) throw new Error(`OpenAI request failed: ${response.status}`);
    const result = await response.json() as { choices?: Array<{ message: { content?: string } }> };
    const generated = JSON.parse(result.choices?.[0]?.message.content ?? '{}') as { ideas?: Array<{ topic: string; reason: string; angle: string }> };
    if (generated.ideas?.length) ideas = generated.ideas.slice(0, 3);
  }

  const saved = await saveWeeklyIdeas(client.id, ideas, { recentActivityNotes: parsed.data.recentActivityNotes });
  return NextResponse.json({ ideas: saved });
});

function fallbackIdeas(client: { firstName: string; jobTitle: string; industry: string; targetAudience: string; topics: string[] }, notes: string) {
  const role = client.jobTitle || 'your role';
  const audience = client.targetAudience || 'your LinkedIn audience';
  const topic = client.topics[0] || client.industry || 'the work you are doing this week';
  return [
    {
      topic: `A practical lesson from ${role}`,
      reason: `It gives ${client.firstName} a simple way to share expertise without sounding promotional.`,
      angle: notes || `Share one recent moment that changed how you think about ${topic}.`,
    },
    {
      topic: `What ${audience} should know about ${topic}`,
      reason: 'It turns everyday expertise into a useful, audience-focused post.',
      angle: 'Start with a common misconception, then explain the clearer way to think about it.',
    },
    {
      topic: 'A small behind-the-scenes observation',
      reason: 'Personal observations tend to feel more human and easier to respond to.',
      angle: 'Describe one conversation, meeting, or decision from this week and the takeaway it created.',
    },
  ];
}
