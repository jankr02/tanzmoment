import { Module } from '@nestjs/common';
import { ContactController } from './contact.controller';
import { ContactService } from './contact.service';

/**
 * Modul für Contact-Funktionalität.
 *
 * Dieses Modul ist aktuell sehr einfach: Es registriert nur
 * den Controller und den Service. Später werden hier weitere
 * Abhängigkeiten hinzukommen:
 *
 * - ConfigModule (für SMTP-Settings)
 * - Nodemailer-Provider (für E-Mail-Versand)
 * - Optional: DatabaseModule (zum Speichern von Submissions)
 * - Optional: ThrottlerModule (für Rate-Limiting)
 */
@Module({
  imports: [
    // Später: ConfigModule, ThrottlerModule, etc.
  ],
  controllers: [ContactController],
  providers: [ContactService],
  exports: [ContactService], // Service exportieren für potenzielle Wiederverwendung
})
export class ContactModule {}
