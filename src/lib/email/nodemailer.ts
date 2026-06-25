/**
  MIT License

  Copyright (c) 2025 AC Autonomous Systems, LLC

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the “Software”), to deal
  in the Software without restriction, including without limitation the rights  
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell  
  copies of the Software, and to permit persons to whom the Software is  
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all  
  copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR  
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,  
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE  
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER  
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,  
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE  
  SOFTWARE.
 */

import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

export default class NodemailerAdapter {
  private transporter: nodemailer.Transporter<
    SMTPTransport.SentMessageInfo,
    SMTPTransport.Options
  >;

  constructor(transport: SMTPTransport | SMTPTransport.Options | string) {
    const transporter = nodemailer.createTransport(transport);
    this.transporter = transporter;
  }

  async sendHTML({
    fromEmail,
    toEmail,
    subject,
    html,
    replyToEmail,
  }: {
    fromEmail: string;
    toEmail: string[];
    subject: string;
    html: string;
    replyToEmail?: string;
  }) {
    await this.transporter.sendMail({
      from: fromEmail,
      to: toEmail,
      ...(replyToEmail && { replyTo: replyToEmail }),
      subject: subject,
      html: html,
    });
  }
}
