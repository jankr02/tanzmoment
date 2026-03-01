import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength } from 'class-validator';

export class CreateNoteDto {
  @ApiProperty({ description: 'Note content', example: 'Has back problems, needs low-impact variants' })
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  content!: string;
}
