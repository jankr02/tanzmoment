import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from './roles.decorator';

export function AdminOnly() {
  return applyDecorators(
    Roles(UserRole.ADMIN),
    UseGuards(JwtAuthGuard, RolesGuard),
    ApiBearerAuth(),
  );
}
