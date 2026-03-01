import { Controller, Get, Patch, Body, Request } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { AdminOnly } from '../../auth/decorators/admin-only.decorator';
import { AdminSettingsService } from './admin-settings.service';
import {
  UpdateStudioSettingsDto,
  StudioSettingsResponseDto,
} from './dto/studio-settings.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@ApiTags('Admin - Settings')
@Controller('admin/settings')
@AdminOnly()
export class AdminSettingsController {
  constructor(private readonly settingsService: AdminSettingsService) {}

  @Get('studio')
  @ApiOperation({ summary: 'Get studio settings' })
  @ApiResponse({ status: 200, type: StudioSettingsResponseDto })
  getStudioSettings(): Promise<StudioSettingsResponseDto> {
    return this.settingsService.getStudioSettings();
  }

  @Patch('studio')
  @ApiOperation({ summary: 'Update studio settings' })
  @ApiResponse({ status: 200, type: StudioSettingsResponseDto })
  updateStudioSettings(
    @Body() dto: UpdateStudioSettingsDto,
  ): Promise<StudioSettingsResponseDto> {
    return this.settingsService.updateStudioSettings(dto);
  }

  @Patch('account/password')
  @ApiOperation({ summary: 'Change own password' })
  @ApiResponse({ status: 200 })
  async changePassword(
    @Request() req: { user: { sub: string } },
    @Body() dto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    await this.settingsService.changePassword(req.user.sub, dto);
    return { message: 'Password updated successfully' };
  }
}
