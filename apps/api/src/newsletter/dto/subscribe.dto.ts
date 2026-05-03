import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';

export class SubscribeDto {
  @ApiProperty()
  @IsEmail({}, { message: 'Bitte gib eine gültige E-Mail-Adresse ein.' })
  email!: string;

  @ApiPropertyOptional({ description: 'DSGVO-Einwilligung (true erforderlich)' })
  @IsOptional()
  @IsBoolean()
  consent?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  source?: string;
}
