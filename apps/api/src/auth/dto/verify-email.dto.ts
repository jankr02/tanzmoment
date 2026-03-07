import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class VerifyEmailDto {
  @ApiProperty({ example: 'abc123tokenxyz' })
  @IsString({ message: 'Token ist erforderlich' })
  token: string;
}
