import { ApiProperty } from '@nestjs/swagger';
import { Equals, IsString } from 'class-validator';

export class DeleteAccountDto {
  @ApiProperty({ example: 'CurrentPass1!' })
  @IsString({ message: 'Aktuelles Passwort ist erforderlich' })
  currentPassword: string;

  @ApiProperty({
    example: 'KONTO LÖSCHEN',
    description: 'Bestätigungstext zur Absicherung gegen versehentliche Löschung',
  })
  @IsString()
  @Equals('KONTO LÖSCHEN', {
    message: 'Bitte gib „KONTO LÖSCHEN" zur Bestätigung ein',
  })
  confirmation: string;
}
