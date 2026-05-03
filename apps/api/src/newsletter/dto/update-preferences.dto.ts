import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdatePreferencesDto {
  @ApiProperty({ description: 'Newsletter abonnieren oder abbestellen' })
  @IsBoolean()
  subscribed!: boolean;
}
