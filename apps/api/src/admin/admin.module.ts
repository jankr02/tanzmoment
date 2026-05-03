import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { NewsModule } from '../news/news.module';
import { NewsletterModule } from '../newsletter/newsletter.module';
import { AdminDashboardController } from './dashboard/admin-dashboard.controller';
import { AdminDashboardService } from './dashboard/admin-dashboard.service';
import { AdminCoursesController } from './courses/admin-courses.controller';
import { AdminCoursesService } from './courses/admin-courses.service';
import { AdminSessionsController } from './sessions/admin-sessions.controller';
import { AdminSessionsService } from './sessions/admin-sessions.service';
import { AdminLocationsController } from './locations/admin-locations.controller';
import { AdminLocationsService } from './locations/admin-locations.service';
import { AdminCalendarController } from './calendar/admin-calendar.controller';
import { AdminCalendarService } from './calendar/admin-calendar.service';
import {
  AdminCustomersController,
  AdminCustomerNotesController,
} from './customers/admin-customers.controller';
import { AdminCustomersService } from './customers/admin-customers.service';
import { AdminFinanceController } from './finance/admin-finance.controller';
import { AdminFinanceService } from './finance/admin-finance.service';
import { AdminSettingsController } from './settings/admin-settings.controller';
import { AdminSettingsService } from './settings/admin-settings.service';
import { AdminCampaignsController } from './news/admin-campaigns.controller';
import { AdminNewsController } from './news/admin-news.controller';
import { AdminNewsService } from './news/admin-news.service';

@Module({
  imports: [AuthModule, NewsModule, NewsletterModule],
  controllers: [
    AdminDashboardController,
    AdminCoursesController,
    AdminSessionsController,
    AdminLocationsController,
    AdminCalendarController,
    AdminCustomersController,
    AdminCustomerNotesController,
    AdminFinanceController,
    AdminSettingsController,
    AdminNewsController,
    AdminCampaignsController,
  ],
  providers: [
    AdminDashboardService,
    AdminCoursesService,
    AdminSessionsService,
    AdminLocationsService,
    AdminCalendarService,
    AdminCustomersService,
    AdminFinanceService,
    AdminSettingsService,
    AdminNewsService,
  ],
})
export class AdminModule {}
