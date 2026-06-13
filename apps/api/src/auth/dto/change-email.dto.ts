import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class ChangeEmailDto {
  @ApiProperty({ example: 'new-address@example.com' })
  @IsEmail({}, { message: 'Bitte gib eine gültige E-Mail-Adresse an' })
  newEmail: string;

  @ApiProperty({ example: 'CurrentPass123!' })
  @IsString()
  currentPassword: string;
}
