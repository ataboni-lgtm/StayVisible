import { NextRequest, NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { routeHandler } from '@/lib/route-handler/route-handler';
import { ZodValidationError } from '@/lib/route-handler/next-errors';
import { db } from '@/lib/db/db';
import { notifications } from '@/lib/stay-visible/schema';
import { readStore } from '@/lib/stay-visible/local-store';
import { channelsForPreference, recipientForChannel, sendEmailNotification, sendSmsNotification } from '@/lib/stay-visible/notification-delivery';
import type { Client, PostOpportunity } from '@/lib/stay-visible/types';

const zEventReminderInput = z.object({
  date: z.string().optional(),
  reminderType: z.enum(['event_photo_reminder', 'photo_upload_prompt']).default('event_photo_reminder'),
});

export const POST = routeHandler(async (request: NextRequest) => {
  const parsed = zEventReminderInput.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return ZodValidationError(parsed.error);

  const date = parsed.data.date ?? new Date().toISOString().slice(0, 10);
  const data = await readStore();
  const opportunities = data.postOpportunities.filter((item) => item.date === date && ['Idea', 'Generated', 'Draft'].includes(item.status));
  const results = [];

  for (const opportunity of opportunities) {
    const client = data.clients.find((item) => item.id === opportunity.clientId && item.status !== 'Paused');
    if (!client) continue;
    const channels = parsed.data.reminderType === 'event_photo_reminder'
      ? (client.email ? ['email' as const] : [])
      : channelsForPreference(client);

    for (const channel of channels) {
      const alreadySent = await hasReminderLog(opportunity.id, parsed.data.reminderType, channel);
      if (alreadySent) {
        results.push({ opportunityId: opportunity.id, channel, status: 'skipped' });
        continue;
      }

      const message = buildReminderMessage(client, opportunity, parsed.data.reminderType, new URL(request.url).origin);
      const delivery = channel === 'email'
        ? await sendEmailNotification({ to: client.email, subject: message.subject, body: message.emailBody })
        : await sendSmsNotification({ to: client.phone, body: message.smsBody });
      await logReminder(client, opportunity, parsed.data.reminderType, channel, recipientForChannel(client, channel), delivery.status);
      results.push({ opportunityId: opportunity.id, channel, status: delivery.status });
    }
  }

  return NextResponse.json({ date, reminderType: parsed.data.reminderType, reminders: results, placeholderMode: results.some((item) => item.status === 'placeholder') });
});

async function hasReminderLog(opportunityId: string, notificationType: string, channel: string) {
  const existing = await db.select({ id: notifications.id }).from(notifications).where(and(
    eq(notifications.postOpportunityId, opportunityId),
    eq(notifications.notificationType, notificationType),
    eq(notifications.channel, channel),
  )).limit(1);
  return existing.length > 0;
}

async function logReminder(client: Client, opportunity: PostOpportunity, notificationType: string, channel: string, recipient: string, status: string) {
  await db.insert(notifications).values({
    clientId: client.id,
    postOpportunityId: opportunity.id,
    notificationType,
    channel,
    recipient,
    status,
    sentAt: new Date(),
  });
}

function buildReminderMessage(client: Client, opportunity: PostOpportunity, reminderType: 'event_photo_reminder' | 'photo_upload_prompt', origin: string) {
  const portalLink = `${process.env.NEXT_PUBLIC_APP_URL ?? origin}/client-login`;
  if (reminderType === 'event_photo_reminder') {
    return {
      subject: `Reminder: take a photo at ${opportunity.topic} today`,
      emailBody: `Hi ${client.firstName},\n\nQuick reminder for ${opportunity.topic} today: take a few photos while you are there.\n\nHelpful shots:\n- You at the event or meeting\n- The room, panel, booth, table, or setting\n- People or companies you may want mentioned\n- Anything visual that captures the moment\n\nYou can upload photos afterward here:\n${portalLink}`,
      smsBody: `Hi ${client.firstName}, quick reminder to take a few photos at ${opportunity.topic} today. Upload them afterward: ${portalLink}`,
    };
  }

  return {
    subject: `Upload photos from ${opportunity.topic}`,
    emailBody: `Hi ${client.firstName},\n\nWhen you have a minute, please upload photos or notes from ${opportunity.topic} so we can draft your LinkedIn post for review.\n\nUpload them here:\n${portalLink}`,
    smsBody: `Hi ${client.firstName}, please upload photos or notes from ${opportunity.topic} so we can draft your LinkedIn post: ${portalLink}`,
  };
}
