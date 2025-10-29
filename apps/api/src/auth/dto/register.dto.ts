import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'max@example.com' })
  @IsEmail({}, { message: 'Bitte gib eine gültige E-Mail-Adresse an' })
  email: string;

  @ApiProperty({ example: 'SecurePass123!' })
  @IsString()
  @MinLength(8, { message: 'Passwort muss mindestens 8 Zeichen lang sein' })
  @MaxLength(50, { message: 'Passwort darf maximal 50 Zeichen lang sein' })
  password: string;

  @ApiProperty({ example: 'Max' })
  @IsString()
  @MinLength(2, { message: 'Vorname muss mindestens 2 Zeichen lang sein' })
  @MaxLength(50)
  firstName: string;

  @ApiProperty({ example: 'Mustermann' })
  @IsString()
  @MinLength(2, { message: 'Nachname muss mindestens 2 Zeichen lang sein' })
  @MaxLength(50)
  lastName: string;

  @ApiProperty({ required: false, example: '+49 176 12345678' })
  @IsString()
  phone?: string;
}
