import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Ip,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Response } from 'express';
import { EmailConfig } from '../config/email.config';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SubscribeDto } from './dto/subscribe.dto';
import { SubscriberStatusDto } from './dto/subscriber-status.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { NewsletterSubscriberService } from './newsletter-subscriber.service';

@ApiTags('Newsletter')
@Controller('newsletter')
export class NewsletterController {
  constructor(
    private readonly subscriberService: NewsletterSubscriberService,
    private readonly configService: ConfigService,
  ) {}

  @Post('subscribe')
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Newsletter abonnieren (Double-Opt-In)' })
  @ApiResponse({ status: 202, type: SubscriberStatusDto })
  async subscribe(
    @Body() dto: SubscribeDto,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string,
  ): Promise<SubscriberStatusDto> {
    const result = await this.subscriberService.subscribe(dto.email, {
      source: dto.source ?? 'footer',
      ipAddress,
      userAgent,
    });
    return { status: result.status };
  }

  @Get('confirm')
  @ApiOperation({ summary: 'Anmeldung über DOI-Link bestätigen' })
  @ApiQuery({ name: 'token' })
  async confirm(@Query('token') token: string, @Res() res: Response): Promise<void> {
    const baseUrl = this.frontendBaseUrl();
    try {
      await this.subscriberService.confirm(token);
      res.redirect(`${baseUrl}/newsletter/bestaetigt`);
    } catch {
      res.redirect(`${baseUrl}/newsletter/bestaetigt?error=1`);
    }
  }

  @Get('unsubscribe')
  @ApiOperation({ summary: 'Vom Newsletter abmelden' })
  @ApiQuery({ name: 'token' })
  async unsubscribe(@Query('token') token: string, @Res() res: Response): Promise<void> {
    const baseUrl = this.frontendBaseUrl();
    try {
      await this.subscriberService.unsubscribeByToken(token);
      res.redirect(`${baseUrl}/newsletter/abgemeldet`);
    } catch {
      res.redirect(`${baseUrl}/newsletter/abgemeldet?error=1`);
    }
  }

  @Post('me/preferences')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Newsletter-Einwilligung des eingeloggten Users setzen' })
  @ApiResponse({ status: 200, type: SubscriberStatusDto })
  async setPreference(
    @CurrentUser() user: { id: string },
    @Body() dto: UpdatePreferencesDto,
  ): Promise<SubscriberStatusDto> {
    const status = await this.subscriberService.setUserPreference(user.id, dto.subscribed);
    return { status };
  }

  @Get('me/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Aktuelle Newsletter-Einwilligung des Users abrufen' })
  @ApiResponse({ status: 200, type: SubscriberStatusDto })
  async getStatus(@CurrentUser() user: { id: string }): Promise<SubscriberStatusDto> {
    const status = await this.subscriberService.getStatusForUser(user.id);
    return { status };
  }

  private frontendBaseUrl(): string {
    const cfg = this.configService.get<EmailConfig>('email');
    return cfg?.baseUrl ?? this.configService.get<string>('FRONTEND_URL', 'http://localhost:4200');
  }
}
