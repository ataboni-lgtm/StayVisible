import type { Client } from './types';
import nodemailer from 'nodemailer';

export type NotificationChannel = 'email' | 'sms';

export async function sendEmailNotification({ to, subject, body }: { to: string; subject: string; body: string }) {
  const gmailUser = process.env.GMAIL_USER || process.env.EMAIL;
  const gmailFrom = process.env.GMAIL_FROM_EMAIL || process.env.EMAIL_FROM || gmailUser;

  if (gmailUser && process.env.GMAIL_APP_PASSWORD) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
    const info = await transporter.sendMail({
      from: gmailFrom,
      to,
      subject,
      text: body,
    });
    return { status: 'sent' as const, provider: 'gmail' as const, providerMessageId: info.messageId };
  }

  if (gmailUser && process.env.EMAIL_CLIENT_ID && process.env.EMAIL_CLIENT_SECRET && process.env.EMAIL_REFRESH_TOKEN) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: gmailUser,
        clientId: process.env.EMAIL_CLIENT_ID,
        clientSecret: process.env.EMAIL_CLIENT_SECRET,
        refreshToken: process.env.EMAIL_REFRESH_TOKEN,
      },
    });
    const info = await transporter.sendMail({
      from: gmailFrom,
      to,
      subject,
      text: body,
    });
    return { status: 'sent' as const, provider: 'gmail' as const, providerMessageId: info.messageId };
  }

  if (!process.env.SENDGRID_API_KEY || !process.env.SENDGRID_FROM_EMAIL) {
    return { status: 'placeholder' as const };
  }

  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: process.env.SENDGRID_FROM_EMAIL },
      subject,
      content: [{ type: 'text/plain', value: body }],
    }),
  });
  if (!response.ok) throw new Error(`SendGrid request failed: ${response.status}`);
  return { status: 'sent' as const, provider: 'sendgrid' as const };
}

export async function sendSmsNotification({ to, body }: { to: string; body: string }) {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
    return { status: 'placeholder' as const };
  }

  const form = new URLSearchParams({ From: process.env.TWILIO_PHONE_NUMBER, To: to, Body: body });
  const auth = Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64');
  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`, {
    method: 'POST',
    headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form,
  });
  if (!response.ok) throw new Error(`Twilio request failed: ${response.status}`);
  return { status: 'sent' as const };
}

export function channelsForPreference(client: Client, fallbackToEmail = true): NotificationChannel[] {
  const channels: NotificationChannel[] = [];
  if (client.notificationMethod === 'Email' || client.notificationMethod === 'Both') channels.push('email');
  if ((client.notificationMethod === 'Text' || client.notificationMethod === 'Both') && client.phone) channels.push('sms');
  if (!channels.length && fallbackToEmail && client.email) channels.push('email');
  return channels;
}

export function recipientForChannel(client: Client, channel: NotificationChannel) {
  return channel === 'email' ? client.email : client.phone;
}
