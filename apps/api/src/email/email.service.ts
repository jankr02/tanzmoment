// ============================================================================
// EMAIL SERVICE
// ============================================================================
// Core email sending service. Uses Nodemailer for SMTP delivery.
// In development, automatically creates Ethereal test accounts.
// ============================================================================

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { EmailConfig } from '../config/email.config';
import { TemplateService, TemplateName } from './template/template.service';
import { EmailSendResult } from './email.types';

@Injectable()
export class EmailService implements OnModuleInit {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;
  private emailConfig: EmailConfig;

  constructor(
    private readonly configService: ConfigService,
    private readonly templateService: TemplateService,
  ) {}

  async onModuleInit(): Promise<void> {
    this.emailConfig = this.configService.get<EmailConfig>('email')!;

    if (!this.emailConfig.enabled) {
      this.logger.warn('Email sending is DISABLED (EMAIL_ENABLED=false)');
      return;
    }

    if (!this.emailConfig.smtp.host || this.emailConfig.smtp.host === 'localhost') {
      await this.setupEtherealTransporter();
    } else {
      this.setupSmtpTransporter();
    }

    try {
      await this.transporter.verify();
      this.logger.log('SMTP connection verified successfully');
    } catch (error) {
      this.logger.error(`SMTP connection failed: ${error.message}`);
    }
  }

  /**
   * Sends an email using a compiled template.
   *
   * Resolves Handlebars variables in the subject line and renders the template.
   */
  async send(
    to: string,
    subject: string,
    template: TemplateName,
    variables: Record<string, unknown>,
    options?: { replyTo?: string },
  ): Promise<EmailSendResult> {
    if (!this.emailConfig?.enabled) {
      this.logger.debug(`Email disabled – skipping send to ${to}: ${subject}`);
      return { success: true, messageId: 'disabled' };
    }

    try {
      const allVariables = {
        ...variables,
        baseUrl: this.emailConfig.baseUrl,
        replyTo: this.emailConfig.replyTo,
        year: new Date().getFullYear(),
      };

      const html = this.templateService.render(template, allVariables);

      const resolvedSubject = subject.replace(
        /\{\{(\w+)\}\}/g,
        (_, key) => String(allVariables[key] ?? ''),
      );

      const info = await this.transporter.sendMail({
        from: this.emailConfig.from,
        replyTo: options?.replyTo ?? this.emailConfig.replyTo,
        to,
        subject: resolvedSubject,
        html,
      });

      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        this.logger.log(`📧 Preview: ${previewUrl}`);
      }

      this.logger.log(
        `Email sent: to=${to}, subject="${resolvedSubject}", messageId=${info.messageId}`,
      );

      return {
        success: true,
        messageId: info.messageId,
        previewUrl: previewUrl || undefined,
      };
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}: ${error.message}`, error.stack);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Creates an Ethereal test account for development.
   * Emails are captured and viewable at https://ethereal.email
   */
  private async setupEtherealTransporter(): Promise<void> {
    const testAccount = await nodemailer.createTestAccount();
    this.transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    this.logger.log(`Using Ethereal test account: ${testAccount.user}`);
  }

  /**
   * Creates SMTP transporter from config.
   */
  private setupSmtpTransporter(): void {
    this.transporter = nodemailer.createTransport({
      host: this.emailConfig.smtp.host,
      port: this.emailConfig.smtp.port,
      secure: this.emailConfig.smtp.secure,
      auth: {
        user: this.emailConfig.smtp.user,
        pass: this.emailConfig.smtp.pass,
      },
    });
    this.logger.log(
      `SMTP configured: ${this.emailConfig.smtp.host}:${this.emailConfig.smtp.port}`,
    );
  }
}
