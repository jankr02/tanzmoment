import { IsString, IsOptional, IsEmail, IsUrl, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateStudioSettingsDto {
  @ApiPropertyOptional({ example: 'Tanzmoment' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ example: 'Tanzen für alle – barrierefrei und kreativ' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  tagline?: string;

  @ApiPropertyOptional({ example: 'Wir sind ein inklusives Tanzstudio...' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'info@tanzmoment.de' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '+49 7473 123456' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @ApiPropertyOptional({ example: 'https://tanzmoment.de' })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiPropertyOptional({ example: 'Musterstraße 1, 72116 Mössingen' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  address?: string;
}

export class StudioSettingsResponseDto {
  name!: string;
  tagline?: string;
  description?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  updatedAt!: Date;
}
