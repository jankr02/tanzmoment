import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, Matches } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ example: 'abc123tokenxyz' })
  @IsString({ message: 'Token ist erforderlich' })
  token: string;

  @ApiProperty({ example: 'NewSecurePass1!' })
  @IsString()
  @MinLength(8, { message: 'Passwort muss mindestens 8 Zeichen lang sein' })
  @Matches(/(?=.*[A-Z])(?=.*[0-9])/, {
    message: 'Passwort muss mindestens eine Zahl und einen Großbuchstaben enthalten',
  })
  password: string;
}
