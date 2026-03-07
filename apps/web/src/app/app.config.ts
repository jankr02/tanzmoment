import {
  ApplicationConfig,
  APP_INITIALIZER,
  isDevMode,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { appRoutes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
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
      withInMemoryScrolling({ scrollPositionRestoration: 'top' })
    ),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimations(),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAuth,
      deps: [AuthStateService, AuthApiService],
      multi: true,
    },
  ],
};
