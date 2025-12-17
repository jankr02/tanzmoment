import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ContactService } from './contact.service';
import { ContactFormDto } from './dto/contact-form.dto';
import { ContactResponseDto } from './dto/contact-response.dto';

/**
 * Controller für den Contact-Endpoint.
 *
 * Verantwortlichkeiten:
 * - HTTP-Requests entgegennehmen
 * - Input-Validation (automatisch durch DTOs)
 * - Business-Logik an Service delegieren
 * - HTTP-Response zurückgeben
 *
 * Der Controller sollte so dünn wie möglich sein – die eigentliche
 * Logik gehört in den Service. Das macht den Code testbarer und
 * flexibler für zukünftige Änderungen.
 */
@ApiTags('contact')
@Controller('contact')
export class ContactController {
  private readonly logger = new Logger(ContactController.name);

  constructor(private readonly contactService: ContactService) {}

  /**
   * POST /api/contact
   *
   * Nimmt Kontaktformular-Submissions entgegen und verarbeitet sie.
   *
   * Im MVP: Loggt die Daten und gibt Success zurück
   * Later: Wird E-Mail versenden über ContactService
   *
   * @param contactFormDto Die validierten Formulardaten
   * @returns Success-Response mit Bestätigungsnachricht
   */
  @Post()
  @HttpCode(HttpStatus.OK) // Explizit 200 statt 201, weil wir nichts "erstellen"
  @ApiOperation({
    summary: 'Kontaktformular absenden',
    description:
      'Sendet die Kontaktformular-Daten an das Backend. ' +
      'Später wird automatisch eine E-Mail versendet.',
  })
  @ApiResponse({
    status: 200,
    description: 'Nachricht erfolgreich verarbeitet',
    type: ContactResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Ungültige Eingabedaten',
  })
  @ApiResponse({
    status: 429,
    description: 'Zu viele Anfragen (Rate-Limiting)',
  })
  async sendContactForm(
    @Body() contactFormDto: ContactFormDto
  ): Promise<ContactResponseDto> {
    // Extra-Check: Privacy muss akzeptiert sein
    // (Sollte bereits durch Frontend validiert sein, aber wir prüfen nochmal)
    if (!contactFormDto.privacyAccepted) {
      this.logger.warn('Privacy not accepted', { email: contactFormDto.email });
      throw new BadRequestException(
        'Die Datenschutzerklärung muss akzeptiert werden.'
      );
    }

    // Business-Logik an Service delegieren
    // Heute: Service loggt nur
    // Später: Service versendet E-Mail
    const result =
      await this.contactService.processContactForm(contactFormDto);

    // Success-Response zurückgeben
    return {
      success: true,
      message: result.message,
      data: result.data,
    };
  }
}
