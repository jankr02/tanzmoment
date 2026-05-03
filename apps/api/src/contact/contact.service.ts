import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ContactFormDto } from './dto/contact-form.dto';
import { EmailService } from '../email/email.service';
import { EMAIL_SUBJECTS } from '../email/email.constants';
import { EmailConfig } from '../config/email.config';

export interface ContactServiceResult {
  message: string;
  data?: {
    processedAt: Date;
  };
}

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  constructor(
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  async processContactForm(
    contactFormDto: ContactFormDto,
  ): Promise<ContactServiceResult> {
    const { name, email, subject, message, phone } = contactFormDto;

    this.logger.log(`New contact form submission from ${email}`);

    const recipient = this.resolveRecipient();

    const studioMail = await this.emailService.send(
      recipient,
      EMAIL_SUBJECTS['contact-form'],
      'contact-form',
      {
        senderName: name,
        senderEmail: email,
        senderPhone: phone ?? '',
        subject,
        message,
      },
      { replyTo: email },
    );

    if (!studioMail.success) {
      this.logger.error(`Studio notification failed: ${studioMail.error}`);
      throw new InternalServerErrorException(
        'Deine Nachricht konnte nicht zugestellt werden. Bitte versuche es später erneut oder kontaktiere uns telefonisch.',
      );
    }

    const confirmationMail = await this.emailService.send(
      email,
      EMAIL_SUBJECTS['contact-confirmation'],
      'contact-confirmation',
      {
        firstName: name.split(' ')[0],
        subject,
        message,
      },
    );

    if (!confirmationMail.success) {
      this.logger.warn(
        `Confirmation mail to ${email} failed but studio was notified: ${confirmationMail.error}`,
      );
    }

    return {
      message:
        'Vielen Dank für deine Nachricht! ' +
        'Wir haben deine Anfrage erhalten und melden uns schnellstmöglich bei dir.',
      data: { processedAt: new Date() },
    };
  }

  private resolveRecipient(): string {
    const explicit = this.configService.get<string>('CONTACT_RECIPIENT_EMAIL');
    if (explicit) return explicit;

    const emailCfg = this.configService.get<EmailConfig>('email');
    return emailCfg?.replyTo ?? 'kontakt@tanzmoment.de';
  }
}
