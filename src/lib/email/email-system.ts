import { google } from 'googleapis';
import NodemailerAdapter from '@/lib/email/nodemailer';
import dotenv from 'dotenv';
dotenv.config({
  path: '.env.local',
});
/**
 * This file is used to initialize the email system.
 * Current implementation uses Resend.
 */

const OAuth2 = google.auth.OAuth2;
const OAuth2_client = new OAuth2(
  process.env.EMAIL_CLIENT_ID,
  process.env.EMAIL_CLIENT_SECRET,
);
OAuth2_client.setCredentials({
  refresh_token: process.env.EMAIL_REFRESH_TOKEN,
});
const accessToken = OAuth2_client.getAccessToken();

export const emailSystem = new NodemailerAdapter({
  service: String('gmail'),
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL,
    clientId: process.env.EMAIL_CLIENT_ID,
    clientSecret: process.env.EMAIL_CLIENT_SECRET,
    refreshToken: process.env.EMAIL_REFRESH_TOKEN,
    accessToken: String(accessToken),
  },
});
