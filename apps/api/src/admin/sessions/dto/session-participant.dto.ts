import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SessionParticipantDto {
  @ApiProperty() bookingId: string;
  @ApiProperty() name: string;
  @ApiProperty() email: string;
  @ApiPropertyOptional() phone?: string;
  @ApiProperty() isGuest: boolean;
  @ApiProperty() bookingStatus: string;
  @ApiPropertyOptional() paymentStatus?: string;
}
