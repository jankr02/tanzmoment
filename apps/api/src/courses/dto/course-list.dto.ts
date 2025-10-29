import { ApiProperty } from '@nestjs/swagger';

export class CourseListItemDto {
  @ApiProperty({ example: 'cm123abc' })
  id: string;

  @ApiProperty({ example: 'contemporary-basics' })
  slug: string;

  @ApiProperty({ example: true })
  isMarkedAsHighlighted: boolean;

  @ApiProperty({ example: 'Contemporary' })
  danceStyle: string;

  @ApiProperty({ required: false, example: 'Finde deinen Flow' })
  catchPhrase?: string;

  @ApiProperty({ example: 'Contemporary Dance – Basics' })
  courseTitle: string;

  @ApiProperty({ 
    example: 'Ein sanfter Einstieg in zeitgenössischen Tanz. Entdecke Bewegung, Atmung und Ausdruck.' 
  })
  courseDescription: string;

  @ApiProperty({ example: '2025-11-06T18:00:00.000Z' })
  dateTime: string;

  @ApiProperty({ example: 'Studio A – Ludwigsburg' })
  location: string;

  @ApiProperty({ example: 25 })
  price: number;

  @ApiProperty({ example: 'Anfänger:innen ohne Vorkenntnisse' })
  targetGroup: string;

  @ApiProperty({ 
    required: false, 
    example: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800' 
  })
  imageUrl?: string;
}
