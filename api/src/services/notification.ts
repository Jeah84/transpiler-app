import { env } from '../config/env';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions): Promise<void> {
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': env.brevoApiKey,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      sender: { name: 'Transpiler', email: 'noreply@transpiler.us' },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Brevo API error: ${response.status} ${body}`);
  }
}

export async function sendVerificationEmail(email: string, token: string): Promise<void> {
  const verifyUrl = `${env.frontendUrl}/verify-email?token=${token}`;

  await sendEmail({
    to: email,
    subject: 'Verify your Transpiler account',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Welcome to Transpiler!</h2>
        <p>Click the button below to verify your email address:</p>
        <a href="${verifyUrl}" 
           style="display: inline-block; padding: 12px 24px; background: #6366f1; color: #fff; text-decoration: none; border-radius: 6px; margin: 16px 0;">
          Verify Email
        </a>
        <p style="color: #666; font-size: 14px;">This link expires in 24 hours.</p>
        <p style="color: #666; font-size: 14px;">If you didn't create an account, you can ignore this email.</p>
      </div>
    `,
  });
}
