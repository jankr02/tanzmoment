import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AdminSessionDto {
  @ApiProperty() id: string;
  @ApiProperty() startTime: Date;
  @ApiProperty() endTime: Date;
  @ApiProperty() status: string;
  @ApiProperty() locationId: string;
  @ApiProperty() locationName: string;
  @ApiProperty() bookedCount: number;
  @ApiProperty() maxParticipants: number;
  @ApiProperty() waitlistCount: number;
}

export class AdminCourseInstructorDto {
  @ApiProperty() id: string;
  @ApiProperty() firstName: string;
  @ApiProperty() lastName: string;
}

export class AdminCourseListItemDto {
  @ApiProperty() id: string;
  @ApiProperty() slug: string;
  @ApiProperty() title: string;
  @ApiProperty() danceStyle: string;
  @ApiProperty() status: string;
  @ApiProperty() visibility: string;
  @ApiProperty() isPublished: boolean;
  @ApiProperty() level: string;
  @ApiProperty() priceInCents: number;
  @ApiProperty() priceFormatted: string;
  @ApiProperty() maxParticipants: number;
  @ApiProperty() instructorName: string;
  @ApiProperty() totalSessions: number;
  @ApiProperty() upcomingSessions: number;
  @ApiProperty() totalBookings: number;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
}

export class AdminCourseDetailDto {
  @ApiProperty() id: string;
  @ApiProperty() slug: string;
  @ApiProperty() title: string;
  @ApiPropertyOptional() catchPhrase?: string;
  @ApiProperty() shortDescription: string;
  @ApiProperty() description: string;
  @ApiProperty() danceStyle: string;
  @ApiProperty() targetGroup: string;
  @ApiProperty() level: string;
  @ApiProperty() duration: number;
  @ApiProperty() maxParticipants: number;
  @ApiProperty() priceInCents: number;
  @ApiProperty({ description: 'Price in euros for form pre-fill' })
  priceInEuros: number;
  @ApiPropertyOptional() imageUrl?: string;
  @ApiProperty() bookingMode: string;
  @ApiProperty() isFree: boolean;
  @ApiProperty() isPublished: boolean;
  @ApiProperty() isMarkedAsHighlighted: boolean;
  @ApiProperty() status: string;
  @ApiProperty() visibility: string;
  @ApiPropertyOptional() detailContent?: Record<string, unknown>;
  @ApiPropertyOptional() metaTitle?: string;
  @ApiPropertyOptional() metaDescription?: string;
  @ApiPropertyOptional() ogImageUrl?: string;
  @ApiPropertyOptional() cancellationPolicyId?: string;
  @ApiProperty() instructorId: string;
  @ApiProperty({ type: AdminCourseInstructorDto })
  instructor: AdminCourseInstructorDto;
  @ApiProperty({ type: [AdminSessionDto] })
  sessions: AdminSessionDto[];
  @ApiProperty() totalBookings: number;
  @ApiProperty() activeBookings: number;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
}

export class PaginatedAdminCoursesResponseDto {
  @ApiProperty({ type: [AdminCourseListItemDto] })
  data: AdminCourseListItemDto[];

  @ApiProperty()
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
  };
}
