import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO für die Response nach Kontaktformular-Submission.
 *
 * Diese Struktur ist absichtlich einfach gehalten, damit wir später
 * weitere Felder hinzufügen können ohne Breaking Changes zu produzieren.
 */
export class ContactResponseDto {
  @ApiProperty({
    description: 'Gibt an, ob die Nachricht erfolgreich verarbeitet wurde',
  })
  success: boolean;

  @ApiProperty({
    description: 'Eine benutzerfreundliche Nachricht',
  })
  message: string;

  @ApiProperty({
    description: 'Optionale zusätzliche Daten',
    required: false,
  })
  data?: {
    processedAt: Date;
    formData?: Record<string, unknown>;
  };
}
