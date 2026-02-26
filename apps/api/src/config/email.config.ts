import { registerAs } from '@nestjs/config';

export interface EmailConfig {
  smtp: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    pass: string;
  };
  from: string;
  replyTo: string;
  /** Base URL for links in emails (e.g., https://tanzmoment.de) */
  baseUrl: string;
  /** Enable/disable email sending (useful for testing) */
  enabled: boolean;
}

export const emailConfig = registerAs('email', (): EmailConfig => ({
  smtp: {
    host: process.env.SMTP_HOST || 'localhost',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
  from: process.env.SMTP_FROM || 'Tanzmoment <noreply@tanzmoment.de>',
  replyTo: process.env.SMTP_REPLY_TO || 'kontakt@tanzmoment.de',
  baseUrl: process.env.APP_URL || 'https://tanzmoment.de',
  enabled: process.env.EMAIL_ENABLED !== 'false',
}));
