export { accountRoutes } from './lib/account.routes';

export { AccountShellComponent } from './lib/components/account-shell/account-shell.component';
export { AccountOverviewComponent } from './lib/pages/account-overview/account-overview.component';
export { AccountSecurityComponent } from './lib/pages/account-security/account-security.component';
export { AccountCommunicationComponent } from './lib/pages/account-communication/account-communication.component';

export { AccountApiService } from './lib/services/account-api.service';
export type {
  UpdateProfileRequest,
  ChangePasswordRequest,
  ChangeEmailRequest,
  DeleteAccountRequest,
} from './lib/services/account.types';
