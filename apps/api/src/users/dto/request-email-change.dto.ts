import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class RequestEmailChangeDto {
  @ApiProperty({ example: 'new@example.com' })
  @IsEmail({}, { message: 'Bitte gib eine gültige E-Mail-Adresse an' })
  newEmail: string;

  @ApiProperty({ example: 'CurrentPass1!' })
  @IsString({ message: 'Aktuelles Passwort ist erforderlich' })
  currentPassword: string;
}
