import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({ example: 'Max' })
  @IsString()
  @MinLength(2, { message: 'Vorname muss mindestens 2 Zeichen lang sein' })
  @MaxLength(50)
  firstName: string;

  @ApiProperty({ example: 'Mustermann' })
  @IsString()
  @MinLength(2, { message: 'Nachname muss mindestens 2 Zeichen lang sein' })
  @MaxLength(50)
  lastName: string;

  @ApiProperty({ required: false, example: '+49 176 12345678' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;
}
