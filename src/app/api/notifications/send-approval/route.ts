import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { routeHandler } from '@/lib/route-handler/route-handler';
import { ZodValidationError } from '@/lib/route-handler/next-errors';
import { supabaseRequest } from '@/lib/supabase/server';
import { createApproval, readStore } from '@/lib/stay-visible/local-store';

const zSendApprovalInput = z.object({ postId: z.string().min(1), approvalUrl: z.string().url() });
export const POST = routeHandler(async (request: NextRequest) => {
  // Authentication: Production deployments should require a Supabase admin session.
  // Authorization: Verify ownership of the post and client.
  // Input validation
  const parsed = zSendApprovalInput.safeParse(await request.json()); if (!parsed.success) return ZodValidationError(parsed.error);
  // Processing the request
  const data = await readStore(); const post = data.posts.find((item) => item.id === parsed.data.postId); if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 }); const client = data.clients.find((item) => item.id === post.clientId); if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 }); const approval = await createApproval(post.id); const approvalUrl = approval ? `${process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin}/approve/${approval.token}` : parsed.data.approvalUrl; const sent: string[] = [];
  if ((client.notificationMethod === 'Email' || client.notificationMethod === 'Both') && process.env.SENDGRID_API_KEY && process.env.SENDGRID_FROM_EMAIL) { const response = await fetch('https://api.sendgrid.com/v3/mail/send', { method: 'POST', headers: { Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ personalizations: [{ to: [{ email: client.email }] }], from: { email: process.env.SENDGRID_FROM_EMAIL }, subject: `LinkedIn post ready for approval: ${post.topic}`, content: [{ type: 'text/plain', value: `Hi ${client.firstName},\n\nYour LinkedIn post draft for ${post.topic} is ready to review.\n\nYou can approve it, edit it, or request changes here:\n${approvalUrl}` }] }) }); if (!response.ok) throw new Error(`SendGrid request failed: ${response.status}`); sent.push('email'); }
  if ((client.notificationMethod === 'Text' || client.notificationMethod === 'Both') && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) { const form = new URLSearchParams({ From: process.env.TWILIO_PHONE_NUMBER, To: client.phone, Body: `Hi ${client.firstName}, your LinkedIn post draft for ${post.topic} is ready to review: ${approvalUrl}` }); const auth = Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64'); const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`, { method: 'POST', headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' }, body: form }); if (!response.ok) throw new Error(`Twilio request failed: ${response.status}`); sent.push('sms'); }
  await supabaseRequest('notifications', { method: 'POST', body: sent.map((channel) => ({ client_id: client.id, post_id: post.id, channel: channel, recipient: channel === 'email' ? client.email : client.phone, status: 'sent', sent_at: new Date().toISOString() })) });
  return NextResponse.json({ sent: sent, approvalUrl, approvalToken: approval?.token, placeholderMode: sent.length === 0 });
});
