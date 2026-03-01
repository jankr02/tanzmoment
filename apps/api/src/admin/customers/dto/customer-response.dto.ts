import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CustomerNoteDto {
  @ApiProperty() id!: string;
  @ApiProperty() content!: string;
  @ApiProperty() createdBy!: string;
  @ApiProperty() createdAt!: Date;
}

export class CustomerBookingPaymentDto {
  @ApiProperty() amountInCents!: number;
  @ApiProperty() status!: string;
  @ApiPropertyOptional({ nullable: true }) paidAt!: Date | null;
}

export class CustomerBookingSessionDto {
  @ApiProperty() id!: string;
  @ApiProperty() startTime!: Date;
  @ApiProperty() locationName!: string;
}

export class CustomerBookingCourseDto {
  @ApiProperty() id!: string;
  @ApiProperty() title!: string;
  @ApiProperty() slug!: string;
}

export class CustomerBookingDto {
  @ApiProperty() id!: string;
  @ApiProperty() status!: string;
  @ApiProperty({ type: CustomerBookingCourseDto }) course!: CustomerBookingCourseDto;
  @ApiPropertyOptional({ type: CustomerBookingSessionDto, nullable: true }) session!: CustomerBookingSessionDto | null;
  @ApiPropertyOptional({ type: CustomerBookingPaymentDto, nullable: true }) payment!: CustomerBookingPaymentDto | null;
  @ApiProperty() createdAt!: Date;
}

export class CustomerListItemDto {
  @ApiProperty() id!: string;
  @ApiProperty() firstName!: string;
  @ApiProperty() lastName!: string;
  @ApiProperty() email!: string;
  @ApiPropertyOptional({ nullable: true }) phone!: string | null;
  @ApiProperty() bookingCount!: number;
  @ApiPropertyOptional({ nullable: true }) lastActivity!: Date | null;
  @ApiProperty() isActive!: boolean;
  @ApiProperty() createdAt!: Date;
}

export class CustomerDetailDto extends CustomerListItemDto {
  @ApiProperty({ type: [CustomerBookingDto] }) bookings!: CustomerBookingDto[];
  @ApiProperty({ type: [CustomerNoteDto] }) notes!: CustomerNoteDto[];
}

export class CustomerListMetaDto {
  @ApiProperty() total!: number;
  @ApiProperty() page!: number;
  @ApiProperty() limit!: number;
  @ApiProperty() totalPages!: number;
}

export class CustomerListResponseDto {
  @ApiProperty({ type: [CustomerListItemDto] }) data!: CustomerListItemDto[];
  @ApiProperty({ type: CustomerListMetaDto }) meta!: CustomerListMetaDto;
}
