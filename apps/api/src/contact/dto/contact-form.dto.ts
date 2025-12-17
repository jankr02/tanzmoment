import {
  IsEmail,
  IsString,
  IsBoolean,
  MinLength,
  MaxLength,
  IsOptional,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO für eingehende Kontaktformular-Daten.
 *
 * Wichtig: Diese Validation ist die letzte Verteidigungslinie.
 * Das Frontend sollte bereits validieren, aber wir können dem
 * Client nicht trauen – jemand könnte die Request manipulieren.
 *
 * Jedes Feld hat:
 * - @ApiProperty für Swagger-Dokumentation
 * - Validation-Decorators für automatische Checks
 * - Deutsche Error-Messages für bessere UX
 */
export class ContactFormDto {
  @ApiProperty({
    description: 'Vollständiger Name des Absenders',
    example: 'Max Mustermann',
    minLength: 2,
    maxLength: 100,
  })
  @IsString({ message: 'Der Name muss ein Text sein.' })
  @MinLength(2, { message: 'Der Name muss mindestens 2 Zeichen lang sein.' })
  @MaxLength(100, { message: 'Der Name darf maximal 100 Zeichen lang sein.' })
  name: string;

  @ApiProperty({
    description: 'E-Mail-Adresse für Rückantworten',
    example: 'max@example.com',
  })
  @IsEmail({}, { message: 'Bitte gib eine gültige E-Mail-Adresse an.' })
  email: string;

  @ApiProperty({
    description: 'Optionale Telefonnummer',
    example: '+49 123 456789',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Die Telefonnummer muss ein Text sein.' })
  @Matches(/^[\d\s+\-()]+$/, {
    message: 'Bitte gib eine gültige Telefonnummer an.',
  })
  phone?: string;

  @ApiProperty({
    description: 'Betreff der Nachricht',
    example: 'Kursanfrage',
    minLength: 3,
    maxLength: 200,
  })
  @IsString({ message: 'Der Betreff muss ein Text sein.' })
  @MinLength(3, {
    message: 'Der Betreff muss mindestens 3 Zeichen lang sein.',
  })
  @MaxLength(200, {
    message: 'Der Betreff darf maximal 200 Zeichen lang sein.',
  })
  subject: string;

  @ApiProperty({
    description: 'Die eigentliche Nachricht',
    example: 'Ich interessiere mich für den Anfängerkurs...',
    minLength: 10,
    maxLength: 500,
  })
  @IsString({ message: 'Die Nachricht muss ein Text sein.' })
  @MinLength(10, {
    message: 'Die Nachricht muss mindestens 10 Zeichen lang sein.',
  })
  @MaxLength(500, {
    message: 'Die Nachricht darf maximal 500 Zeichen lang sein.',
  })
  message: string;

  @ApiProperty({
    description: 'Bestätigung der Datenschutzerklärung',
    example: true,
  })
  @IsBoolean({ message: 'Die Datenschutzerklärung muss akzeptiert werden.' })
  privacyAccepted: boolean;
}
