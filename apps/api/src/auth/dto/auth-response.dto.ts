import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class UserDto {
  @ApiProperty({ example: 'cm123abc' })
  id: string;

  @ApiProperty({ example: 'max@example.com' })
  email: string;

  @ApiProperty({ example: 'Max' })
  firstName: string;

  @ApiProperty({ example: 'Mustermann' })
  lastName: string;

  @ApiProperty({ required: false, example: '+49 176 12345678' })
  phone?: string;

  @ApiProperty({ enum: UserRole, example: 'CUSTOMER' })
  role: UserRole;

  @ApiProperty({ example: true })
  emailVerified: boolean;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: '2025-10-29T16:47:59.000Z' })
  createdAt: string;
}
