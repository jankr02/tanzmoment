import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({ example: 'current-password' })
  @IsString()
  currentPassword!: string;

  @ApiProperty({ example: 'new-secure-password-123' })
  @IsString()
  @MinLength(8)
  newPassword!: string;
}
