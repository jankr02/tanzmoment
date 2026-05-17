import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ example: 'CurrentPass1!' })
  @IsString({ message: 'Aktuelles Passwort ist erforderlich' })
  currentPassword: string;

  @ApiProperty({ example: 'NewSecurePass1!' })
  @IsString()
  @MinLength(8, { message: 'Passwort muss mindestens 8 Zeichen lang sein' })
  @MaxLength(50, { message: 'Passwort darf maximal 50 Zeichen lang sein' })
  @Matches(/(?=.*[A-Z])(?=.*[0-9])/, {
    message: 'Passwort muss mindestens eine Zahl und einen Großbuchstaben enthalten',
  })
  newPassword: string;
}
