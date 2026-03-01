import {
  IsString,
  IsInt,
  IsNumber,
  Min,
  Max,
  IsEnum,
  IsOptional,
  IsBoolean,
  MaxLength,
  IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BookingMode, CourseLevel, CourseVisibility } from '@prisma/client';

export class CreateCourseDto {
  @ApiProperty({ example: 'Ausdruckstanz - frei & verbunden' })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiProperty({ example: 'Deinen wahren Ausdruck findest du nicht im Spiegel...' })
  @IsString()
  @MaxLength(500)
  shortDescription: string;

  @ApiProperty({ example: 'Full course description...' })
  @IsString()
  description: string;

  @ApiProperty({ example: 'expressive' })
  @IsString()
  danceStyle: string;

  @ApiProperty({ example: 'Erwachsene' })
  @IsString()
  targetGroup: string;

  @ApiProperty({ enum: CourseLevel, example: 'ALL_LEVELS' })
  @IsEnum(CourseLevel)
  level: CourseLevel;

  @ApiProperty({ description: 'Duration in minutes', example: 90 })
  @IsInt()
  @Min(15)
  @Max(480)
  duration: number;

  @ApiProperty({ description: 'Max participants per session', example: 12 })
  @IsInt()
  @Min(1)
  @Max(100)
  maxParticipants: number;

  @ApiProperty({ description: 'Price in EUROS (e.g. 19.50)', example: 19.5 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  priceInEuros: number;

  @ApiProperty({ enum: BookingMode, example: 'FULL_COURSE' })
  @IsEnum(BookingMode)
  bookingMode: BookingMode;

  @ApiPropertyOptional({ example: 'Mein Tipp ...' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  catchPhrase?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isFree?: boolean;

  @ApiPropertyOptional({ enum: CourseVisibility, default: 'PUBLIC' })
  @IsOptional()
  @IsEnum(CourseVisibility)
  visibility?: CourseVisibility;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isMarkedAsHighlighted?: boolean;

  @ApiPropertyOptional({
    description: 'Instructor ID. If omitted, uses the current user\'s instructor profile.',
  })
  @IsOptional()
  @IsString()
  instructorId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  metaTitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  metaDescription?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cancellationPolicyId?: string;

  @ApiPropertyOptional({ description: 'CMS detail content JSON' })
  @IsOptional()
  @IsObject()
  detailContent?: Record<string, unknown>;
}
