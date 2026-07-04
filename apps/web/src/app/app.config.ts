import {
  ApplicationConfig,
  APP_INITIALIZER,
  LOCALE_ID,
  isDevMode,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import {
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling,
} from '@angular/router';

registerLocaleData(localeDe);
import { appRoutes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';
import {
  provideHttpClient,
  withInterceptors,
  withXsrfConfiguration,
} from '@angular/common/http';
import { authInterceptor, AuthStateService, AuthApiService } from '@tanzmoment/shared/services';

function initializeAuth(authState: AuthStateService, authApi: AuthApiService) {
  return () => authState.initialize(() => authApi.getMeAsync());
}

export const appConfig: ApplicationConfig = {
  providers: [
    ...(isDevMode() ? [] : [provideClientHydration(withEventReplay())]),
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      appRoutes,
      withComponentInputBinding(),
      withInMemoryScrolling({ scrollPositionRestoration: 'top' })
    ),
    provideHttpClient(
      withInterceptors([authInterceptor]),
      // Double-submit CSRF: read the XSRF-TOKEN cookie, echo it as X-XSRF-TOKEN
      // on mutating same-origin requests (defaults, made explicit for clarity).
      withXsrfConfiguration({
        cookieName: 'XSRF-TOKEN',
        headerName: 'X-XSRF-TOKEN',
      }),
    ),
    provideAnimations(),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAuth,
      deps: [AuthStateService, AuthApiService],
      multi: true,
    },
    { provide: LOCALE_ID, useValue: 'de' },
  ],
};
