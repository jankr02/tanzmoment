import { ApiProperty } from '@nestjs/swagger';
import { CourseLevel, SessionStatus } from '@prisma/client';

export class InstructorDto {
  @ApiProperty({ example: 'cm123abc' })
  id: string;

  @ApiProperty({ example: 'Sarah' })
  firstName: string;

  @ApiProperty({ example: 'Müller' })
  lastName: string;

  @ApiProperty({ 
    required: false, 
    example: 'Professionelle Tänzerin mit 15 Jahren Erfahrung...' 
  })
  bio?: string;

  @ApiProperty({ 
    required: false, 
    example: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400' 
  })
  imageUrl?: string;

  @ApiProperty({ 
    type: [String], 
    example: ['Contemporary', 'Modern', 'Improvisation'] 
  })
  expertise: string[];
}

export class SessionDto {
  @ApiProperty({ example: 'cm123session' })
  id: string;

  @ApiProperty({ example: '2025-11-06T18:00:00.000Z' })
  startTime: string;

  @ApiProperty({ example: '2025-11-06T19:30:00.000Z' })
  endTime: string;

  @ApiProperty({ example: 'Studio A – Ludwigsburg' })
  location: string;

  @ApiProperty({ enum: SessionStatus, example: 'SCHEDULED' })
  status: SessionStatus;

  @ApiProperty({ example: 12 })
  availableSpots: number;
}

export class CourseDetailDto {
  @ApiProperty({ example: 'cm123abc' })
  id: string;

  @ApiProperty({ example: 'contemporary-basics' })
  slug: string;

  @ApiProperty({ example: 'Contemporary Dance – Basics' })
  title: string;

  @ApiProperty({ required: false, example: 'Finde deinen Flow' })
  catchPhrase?: string;

  @ApiProperty({ 
    example: 'Ein sanfter Einstieg in zeitgenössischen Tanz...' 
  })
  shortDescription: string;

  @ApiProperty({ 
    example: 'Ein sanfter Einstieg in die Welt des zeitgenössischen Tanzes. Wir erkunden Grundbewegungen...' 
  })
  description: string;

  @ApiProperty({ example: 'Contemporary' })
  danceStyle: string;

  @ApiProperty({ example: 'Anfänger:innen ohne Vorkenntnisse' })
  targetGroup: string;

  @ApiProperty({ enum: CourseLevel, example: 'BEGINNER' })
  level: CourseLevel;

  @ApiProperty({ example: 12 })
  maxParticipants: number;

  @ApiProperty({ example: 2500 })
  priceInCents: number;

  @ApiProperty({ example: 25 })
  price: number;

  @ApiProperty({ example: 90 })
  duration: number;

  @ApiProperty({ 
    required: false, 
    example: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800' 
  })
  imageUrl?: string;

  @ApiProperty({ example: true })
  isMarkedAsHighlighted: boolean;

  @ApiProperty({ example: true })
  isPublished: boolean;

  @ApiProperty({ type: InstructorDto })
  instructor: InstructorDto;

  @ApiProperty({ type: [SessionDto] })
  sessions: SessionDto[];

  @ApiProperty({ example: '2025-10-29T16:47:59.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2025-10-29T16:47:59.000Z' })
  updatedAt: string;
}
