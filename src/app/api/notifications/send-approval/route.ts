import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { routeHandler } from '@/lib/route-handler/route-handler';
import { ZodValidationError } from '@/lib/route-handler/next-errors';
import { createApproval, readStore } from '@/lib/stay-visible/local-store';
import {
  channelsForPreference,
  recipientForChannel,
  sendEmailNotification,
  sendSmsNotification,
  type NotificationChannel,
} from '@/lib/stay-visible/notification-delivery';

const zSendApprovalInput = z.object({
  postId: z.string().min(1),
  approvalUrl: z.string().url(),
});

export const POST = routeHandler(async (request: NextRequest) => {
  const parsed = zSendApprovalInput.safeParse(await request.json());
  if (!parsed.success) return ZodValidationError(parsed.error);

  const data = await readStore();
  const post = data.posts.find((item) => item.id === parsed.data.postId);
  if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 });

  const client = data.clients.find((item) => item.id === post.clientId);
  if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 });

  const approval = await createApproval(post.id);
  const approvalUrl = approval
    ? `${process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin}/approve/${approval.token}`
    : parsed.data.approvalUrl;

  const emailBody = `Hi ${client.firstName},

Your LinkedIn post draft for ${post.topic} is ready to review.

You can approve it, edit it, or request changes here:
${approvalUrl}`;
  const smsBody = `Hi ${client.firstName}, your LinkedIn post draft for ${post.topic} is ready to review: ${approvalUrl}`;

  const results: Array<{ channel: NotificationChannel; status: string }> = [];
  for (const channel of channelsForPreference(client)) {
    const recipient = recipientForChannel(client, channel);
    if (!recipient) continue;

    const result = channel === 'email'
      ? await sendEmailNotification({
        to: recipient,
        subject: `LinkedIn post ready for approval: ${post.topic}`,
        body: emailBody,
      })
      : await sendSmsNotification({ to: recipient, body: smsBody });

    await logApprovalNotification({
      clientId: client.id,
      postId: post.id,
      approvalId: approval?.id,
      channel,
      recipient,
      status: result.status,
      providerMessageId: getProviderMessageId(result),
    });
    results.push({ channel, status: result.status });
  }

  return NextResponse.json({
    sent: results.filter((result) => result.status === 'sent').map((result) => result.channel),
    attempted: results,
    approvalUrl,
    approvalToken: approval?.token,
    placeholderMode: results.length === 0 || results.every((result) => result.status === 'placeholder'),
  });
});

function getProviderMessageId(result: unknown) {
  if (!result || typeof result !== 'object' || !('providerMessageId' in result)) return undefined;
  return typeof result.providerMessageId === 'string' ? result.providerMessageId : undefined;
}

async function logApprovalNotification({
  clientId,
  postId,
  approvalId,
  channel,
  recipient,
  status,
  providerMessageId,
}: {
  clientId: string;
  postId: string;
  approvalId?: string;
  channel: NotificationChannel;
  recipient: string;
  status: string;
  providerMessageId?: string;
}) {
  if (!process.env.DB_CONNECTION_STRING) return;

  const [{ db }, { notifications }] = await Promise.all([
    import('@/lib/db/db'),
    import('@/lib/stay-visible/schema'),
  ]);

  await db.insert(notifications).values({
    clientId,
    postId,
    approvalId,
    notificationType: 'approval_ready',
    channel,
    recipient,
    providerMessageId,
    status,
    sentAt: status === 'sent' ? new Date() : null,
  });
}
