import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'max@example.com' })
  @IsEmail({}, { message: 'Bitte gib eine gültige E-Mail-Adresse an' })
  email: string;
}
