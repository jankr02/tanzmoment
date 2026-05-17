import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserDto } from '../auth/dto/auth-response.dto';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RequestEmailChangeDto } from './dto/request-email-change.dto';
import { ConfirmEmailChangeDto } from './dto/confirm-email-change.dto';
import { DeleteAccountDto } from './dto/delete-account.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get own user profile' })
  @ApiResponse({ status: 200, type: UserDto })
  async getProfile(@CurrentUser() user: { id: string }) {
    return this.usersService.getProfile(user.id);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update own name and phone' })
  @ApiResponse({ status: 200, type: UserDto })
  async updateProfile(
    @CurrentUser() user: { id: string },
    @Body(ValidationPipe) dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(user.id, dto);
  }

  @Patch('me/password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change own password (requires current password)' })
  @ApiResponse({ status: 200, description: 'Password updated' })
  @ApiResponse({ status: 401, description: 'Current password incorrect' })
  async changePassword(
    @CurrentUser() user: { id: string },
    @Body(ValidationPipe) dto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(user.id, dto);
  }

  @Post('me/email/change')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Request email-address change (sends confirmation to new address)',
  })
  @ApiResponse({ status: 200, description: 'Confirmation email sent' })
  @ApiResponse({ status: 401, description: 'Current password incorrect' })
  @ApiResponse({ status: 409, description: 'Email already in use' })
  async requestEmailChange(
    @CurrentUser() user: { id: string },
    @Body(ValidationPipe) dto: RequestEmailChangeDto,
  ) {
    return this.usersService.requestEmailChange(user.id, dto);
  }

  @Post('me/email/confirm')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirm pending email-address change with token' })
  @ApiResponse({ status: 200, description: 'Email changed' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async confirmEmailChange(@Body(ValidationPipe) dto: ConfirmEmailChangeDto) {
    return this.usersService.confirmEmailChange(dto);
  }

  @Delete('me/email/change')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel a pending email-address change' })
  @ApiResponse({ status: 200, description: 'Pending change cancelled' })
  async cancelEmailChange(@CurrentUser() user: { id: string }) {
    return this.usersService.cancelEmailChange(user.id);
  }

  @Delete('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete (anonymize) own account – GDPR compliant soft-delete',
  })
  @ApiResponse({ status: 200, description: 'Account anonymized' })
  @ApiResponse({ status: 401, description: 'Current password incorrect' })
  async deleteAccount(
    @CurrentUser() user: { id: string },
    @Body(ValidationPipe) dto: DeleteAccountDto,
  ) {
    return this.usersService.deleteAccount(user.id, dto);
  }
}
