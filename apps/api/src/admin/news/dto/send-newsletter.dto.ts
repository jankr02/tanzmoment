import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsEmail, IsOptional } from 'class-validator';

export class SendNewsletterDto {
  @ApiPropertyOptional({ description: 'ISO-Datum für geplanten Versand. Leer = sofort.' })
  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'scheduledAt muss ein gültiges Datum sein' })
  scheduledAt?: Date;
}

export class TestSendNewsletterDto {
  @ApiPropertyOptional()
  @IsEmail({}, { message: 'Ungültige Test-E-Mail-Adresse' })
  email!: string;
}
