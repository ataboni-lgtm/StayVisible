import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { routeHandler } from '@/lib/route-handler/route-handler';
import { ZodValidationError } from '@/lib/route-handler/next-errors';
import { isSupabaseConfigured, supabaseRequest } from '@/lib/supabase/server';
const zApprovalInput = z.object({ action: z.enum(['approve', 'approve_copy', 'changes_requested', 'reject']), caption: z.string().min(1), feedback: z.string().optional() });
export const PATCH = routeHandler(async (request: NextRequest, { params }: { params: Promise<{ token: string }> }) => {
  // Authentication: The cryptographically random, single-post token is the credential.
  // Authorization: Query only the approval row matching this token. Never expose admin records.
  const { token } = await params;
  // Input validation
  const parsed = zApprovalInput.safeParse(await request.json()); if (!parsed.success) return ZodValidationError(parsed.error);
  // Processing the request
  const configured = isSupabaseConfigured(); if (configured) { const approvals = await supabaseRequest<Array<{ id: string; post_id: string; client_id: string }>>(`approvals?approval_token=eq.${encodeURIComponent(token)}&is_active=eq.true&select=id,post_id,client_id&limit=1`); const approval = approvals?.[0]; if (!approval) return NextResponse.json({ error: 'Approval link is invalid or expired.' }, { status: 404 }); const posts = await supabaseRequest<Array<{ caption: string }>>(`posts?id=eq.${approval.post_id}&select=caption&limit=1`); const originalCaption = posts?.[0]?.caption ?? ''; const status = parsed.data.action.startsWith('approve') ? 'Approved' : parsed.data.action === 'reject' ? 'Rejected' : 'Changes Requested'; await supabaseRequest(`posts?id=eq.${approval.post_id}`, { method: 'PATCH', body: { caption: parsed.data.caption, status: status } }); await supabaseRequest(`approvals?id=eq.${approval.id}`, { method: 'PATCH', body: { action: parsed.data.action, feedback: parsed.data.feedback, responded_at: new Date().toISOString(), is_active: false } }); const learningNote = extractLearningNote(originalCaption, parsed.data.caption, parsed.data.feedback, parsed.data.action); if (parsed.data.caption || parsed.data.feedback) await supabaseRequest('edit_feedback', { method: 'POST', body: { client_id: approval.client_id, post_id: approval.post_id, original_caption: originalCaption, final_caption: parsed.data.caption, feedback: parsed.data.feedback, feedback_type: parsed.data.action, extracted_learning: learningNote } }); if (learningNote) { const profiles = await supabaseRequest<Array<{ learning_notes: string[] | null }>>(`voice_profiles?client_id=eq.${approval.client_id}&select=learning_notes&limit=1`); const existingNotes = profiles?.[0]?.learning_notes ?? []; await supabaseRequest(`voice_profiles?client_id=eq.${approval.client_id}`, { method: 'PATCH', body: { learning_notes: [...existingNotes, learningNote] } }); } }
  return NextResponse.json({ success: true, demoMode: !configured });
});

function extractLearningNote(originalCaption: string, finalCaption: string, feedback = '', action: string) {
  const notes: string[] = [];
  if (feedback.trim()) notes.push(`Client feedback: ${feedback.trim()}`);
  if (originalCaption.length > finalCaption.length + 80) notes.push('Client shortened the draft.');
  if (/#\w+/.test(originalCaption) && !/#\w+/.test(finalCaption)) notes.push('Client removed hashtags.');
  if (/\p{Extended_Pictographic}/u.test(originalCaption) && !/\p{Extended_Pictographic}/u.test(finalCaption)) notes.push('Client removed emojis.');
  if (action === 'changes_requested') notes.push('Client requested changes before approval.');
  return notes[0] ?? '';
}
