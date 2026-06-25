import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { routeHandler } from '@/lib/route-handler/route-handler';
import { ZodValidationError } from '@/lib/route-handler/next-errors';
import { supabaseRequest } from '@/lib/supabase/server';
import { emptyVoiceProfile } from '@/lib/stay-visible/demo-data';
import { saveVoiceProfile } from '@/lib/stay-visible/local-store';
import type { VoiceProfile } from '@/lib/stay-visible/types';

const zGenerateVoiceProfileInput = z.object({ clientId: z.string().min(1), onboarding: z.record(z.string(), z.unknown()) });
export const POST = routeHandler(async (request: NextRequest) => {
  // Authentication: Production deployments should require a Supabase admin session.
  // Authorization: Verify ownership of clientId before generating or saving.
  // Input validation
  const parsed = zGenerateVoiceProfileInput.safeParse(await request.json());
  if (!parsed.success) return ZodValidationError(parsed.error);
  // Processing the request
  let profile: Record<string, unknown> = { ...emptyVoiceProfile };
  if (process.env.OPENAI_API_KEY) { const response = await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST', headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model: 'gpt-4.1-mini', response_format: { type: 'json_object' }, messages: [{ role: 'system', content: 'Build a structured LinkedIn voice profile. Return JSON with tone_summary, sentence_style, vocabulary_style, post_length_preference, common_phrases, words_to_avoid, emoji_rules, hashtag_rules, first_person_preference, personal_professional_balance, example_post, dos, and donts. Never use an em dash.' }, { role: 'user', content: JSON.stringify(parsed.data.onboarding) }] }) }); if (!response.ok) throw new Error(`OpenAI request failed: ${response.status}`); const result = await response.json() as { choices?: Array<{ message: { content?: string } }> }; profile = JSON.parse(result.choices?.[0]?.message.content ?? '{}') as Record<string, unknown>; }
  const saved = await saveVoiceProfile(parsed.data.clientId, camelizeVoiceProfile(profile), parsed.data.onboarding);
  await supabaseRequest('voice_profiles?on_conflict=client_id', { method: 'POST', prefer: 'resolution=merge-duplicates,return=representation', body: { client_id: parsed.data.clientId, ...profile, source_answers: parsed.data.onboarding } });
  return NextResponse.json({ profile: saved.profile });
});

function camelizeVoiceProfile(profile: Record<string, unknown>): Partial<VoiceProfile> {
  return {
    toneSummary: stringValue(profile.tone_summary ?? profile.toneSummary),
    sentenceStyle: stringValue(profile.sentence_style ?? profile.sentenceStyle),
    vocabularyStyle: stringValue(profile.vocabulary_style ?? profile.vocabularyStyle),
    postLengthPreference: stringValue(profile.post_length_preference ?? profile.postLengthPreference),
    commonPhrases: stringArray(profile.common_phrases ?? profile.commonPhrases),
    wordsToAvoid: stringArray(profile.words_to_avoid ?? profile.wordsToAvoid),
    emojiRules: stringValue(profile.emoji_rules ?? profile.emojiRules),
    hashtagRules: stringValue(profile.hashtag_rules ?? profile.hashtagRules),
    firstPersonPreference: stringValue(profile.first_person_preference ?? profile.firstPersonPreference),
    personalProfessionalBalance: stringValue(profile.personal_professional_balance ?? profile.personalProfessionalBalance),
    examplePost: stringValue(profile.example_post ?? profile.examplePost),
    dos: stringArray(profile.dos),
    donts: stringArray(profile.donts),
  };
}

function stringValue(value: unknown) {
  return typeof value === 'string' ? value : '';
}

function stringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}
