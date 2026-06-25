import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { routeHandler } from '@/lib/route-handler/route-handler';
import { ZodValidationError } from '@/lib/route-handler/next-errors';
import { clients, getPost } from '@/lib/stay-visible/demo-data';
import { supabaseRequest } from '@/lib/supabase/server';

const zSendApprovalInput = z.object({ postId: z.string().min(1), approvalUrl: z.string().url() });
export const POST = routeHandler(async (request: NextRequest) => {
  // Authentication: Production deployments should require a Supabase admin session.
  // Authorization: Verify ownership of the post and client.
  // Input validation
  const parsed = zSendApprovalInput.safeParse(await request.json()); if (!parsed.success) return ZodValidationError(parsed.error);
  // Processing the request
  const post = getPost(parsed.data.postId); if (!post) return NextResponse.json({ sent: [], placeholderMode: true }); const client = clients.find((item) => item.id === post.clientId); if (!client) return NextResponse.json({ sent: [], placeholderMode: true }); const sent: string[] = [];
  if ((client.notificationMethod === 'Email' || client.notificationMethod === 'Both') && process.env.SENDGRID_API_KEY && process.env.SENDGRID_FROM_EMAIL) { const response = await fetch('https://api.sendgrid.com/v3/mail/send', { method: 'POST', headers: { Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ personalizations: [{ to: [{ email: client.email }] }], from: { email: process.env.SENDGRID_FROM_EMAIL }, subject: `LinkedIn post ready for approval: ${post.topic}`, content: [{ type: 'text/plain', value: `Hi ${client.firstName},\n\nYour LinkedIn post draft for ${post.topic} is ready to review.\n\nYou can approve it, edit it, or request changes here:\n${parsed.data.approvalUrl}` }] }) }); if (!response.ok) throw new Error(`SendGrid request failed: ${response.status}`); sent.push('email'); }
  if ((client.notificationMethod === 'Text' || client.notificationMethod === 'Both') && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) { const form = new URLSearchParams({ From: process.env.TWILIO_PHONE_NUMBER, To: client.phone, Body: `Hi ${client.firstName}, your LinkedIn post draft for ${post.topic} is ready to review: ${parsed.data.approvalUrl}` }); const auth = Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64'); const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`, { method: 'POST', headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' }, body: form }); if (!response.ok) throw new Error(`Twilio request failed: ${response.status}`); sent.push('sms'); }
  await supabaseRequest('notifications', { method: 'POST', body: sent.map((channel) => ({ client_id: client.id, post_id: post.id, channel: channel, recipient: channel === 'email' ? client.email : client.phone, status: 'sent', sent_at: new Date().toISOString() })) });
  return NextResponse.json({ sent: sent, demoMode: sent.length === 0 });
});
