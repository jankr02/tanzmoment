import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLocationDto {
  @ApiProperty({ example: 'Mössingen' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ example: 'Bahnhofstraße 12, 72116 Mössingen' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;
}
