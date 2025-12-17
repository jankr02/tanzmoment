import { Injectable, Logger } from '@nestjs/common';
import { ContactFormDto } from './dto/contact-form.dto';

/**
 * Service-Response nach Verarbeitung der Kontaktformular-Daten.
 */
export interface ContactServiceResult {
  message: string;
  data?: {
    processedAt: Date;
    formData?: Partial<ContactFormDto>;
  };
}

/**
 * Service für die Business-Logik rund um Kontaktformular-Submissions.
 *
 * Architektur-Design für Erweiterbarkeit:
 *
 * Die Methode `processContactForm` ist der zentrale Einstiegspunkt.
 * Sie orchestriert alle Schritte, die nach einer Formular-Submission
 * passieren sollen. Heute sind das:
 * 1. Daten loggen
 * 2. Success-Response zurückgeben
 *
 * Später werden das sein:
 * 1. Daten loggen
 * 2. E-Mail vorbereiten und versenden (neue Methode `sendEmail`)
 * 3. Optional: In Datenbank speichern
 * 4. Optional: Slack-Notification senden
 * 5. Success-Response zurückgeben
 *
 * Wichtig: Der Controller muss dafür nicht geändert werden!
 * Er ruft weiterhin nur `processContactForm` auf und bekommt
 * das gleiche Result-Format zurück.
 */
@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  /**
   * Verarbeitet eine Kontaktformular-Submission.
   *
   * MVP-Version: Loggt die Daten und gibt Success zurück
   *
   * Future-Version: Wird zusätzlich eine E-Mail versenden
   * (siehe Kommentare im Code für Erweiterungs-Punkte)
   *
   * @param contactFormDto Die validierten Formulardaten
   * @returns Result-Object mit Success-Message
   */
  async processContactForm(
    contactFormDto: ContactFormDto
  ): Promise<ContactServiceResult> {
    const { name, email, subject, message, phone } = contactFormDto;

    // ──────────────────────────────────────────────────────────────────────
    // SCHRITT 1: Daten loggen (für Debugging und Monitoring)
    // ──────────────────────────────────────────────────────────────────────
    this.logger.log(`New contact form submission from ${email}`);
    this.logger.debug('Form data:', {
      name,
      email,
      phone,
      subject,
      messageLength: message.length,
    });

    // ──────────────────────────────────────────────────────────────────────
    // SCHRITT 2: E-Mail versenden (wird später hier eingebaut)
    // ──────────────────────────────────────────────────────────────────────

    // TODO: Später hier die E-Mail-Funktionalität einfügen
    // await this.sendEmail(contactFormDto);

    // Für den MVP simulieren wir eine kurze Verarbeitungszeit
    // (in der Realität würde hier der E-Mail-Versand Zeit brauchen)
    await this.simulateProcessing();

    // ──────────────────────────────────────────────────────────────────────
    // SCHRITT 3: Optional - In Datenbank speichern
    // ──────────────────────────────────────────────────────────────────────

    // TODO: Optional für später - Submissions in DB speichern für Tracking
    // await this.saveToDatabase(contactFormDto);

    // ──────────────────────────────────────────────────────────────────────
    // SCHRITT 4: Success-Response vorbereiten
    // ──────────────────────────────────────────────────────────────────────

    return {
      message:
        'Vielen Dank für deine Nachricht! ' +
        'Wir haben deine Anfrage erhalten und melden uns schnellstmöglich bei dir.',
      data: {
        processedAt: new Date(),
        // Im Produktiv-Modus würden wir hier keine FormData zurückgeben,
        // aber im Dev-Modus ist es hilfreich fürs Debugging
        ...(process.env.NODE_ENV === 'development' && {
          formData: { name, email, subject },
        }),
      },
    };
  }

  /**
   * Simuliert eine asynchrone Verarbeitung (z.B. E-Mail-Versand).
   *
   * Diese Methode ist nur für den MVP. Sie simuliert, dass die
   * Verarbeitung Zeit braucht (wie es bei echtem E-Mail-Versand
   * der Fall wäre). Das hilft uns, die Loading-States im Frontend
   * zu testen.
   */
  private async simulateProcessing(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, 500); // 500ms Verzögerung
    });
  }

  // ──────────────────────────────────────────────────────────────────────────
  // FUTURE: E-Mail-Versand (wird später implementiert)
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Versendet eine E-Mail mit den Kontaktformular-Daten.
   *
   * Diese Methode ist für die Zukunft vorbereitet. Wenn wir bereit sind,
   * E-Mails zu versenden, müssen wir nur:
   *
   * 1. Nodemailer-Dependency hinzufügen: `npm install nodemailer`
   * 2. SMTP-Config in Environment-Variables setzen
   * 3. Diese Methode implementieren
   * 4. In `processContactForm` das TODO durch Aufruf ersetzen
   *
   * Beispiel-Implementation (auskommentiert):
   *
   * ```typescript
   * private async sendEmail(data: ContactFormDto): Promise<void> {
   *   const mailOptions = {
   *     from: process.env.SMTP_FROM,
   *     to: process.env.CONTACT_EMAIL,
   *     replyTo: data.email,
   *     subject: `Kontaktanfrage: ${data.subject}`,
   *     html: this.generateEmailTemplate(data)
   *   };
   *
   *   await this.transporter.sendMail(mailOptions);
   * }
   * ```
   */
  // private async sendEmail(data: ContactFormDto): Promise<void> {
  //   // Implementation kommt später
  //   throw new Error('E-Mail functionality not yet implemented');
  // }

  /**
   * Generiert das HTML-Template für die E-Mail.
   *
   * Auch diese Methode ist für später vorbereitet. Sie würde ein
   * gut formatiertes HTML-E-Mail-Template generieren.
   */
  // private generateEmailTemplate(data: ContactFormDto): string {
  //   // Implementation kommt später
  //   return '';
  // }
}
