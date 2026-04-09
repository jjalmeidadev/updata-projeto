import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideAuth0, authHttpInterceptorFn } from '@auth0/auth0-angular';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideAuth0({
      domain: 'dev-e8hme66hgt4cf75n.us.auth0.com',
      clientId: 'UdMuqErwkmF1lmBbHZz77ejJAhCt4dur',
      authorizationParams: {
        redirect_uri: window.location.origin + '/login',
        audience: 'https://api.updata.com',
        scope: 'openid profile email',
      },
      httpInterceptor: {
        allowedList: [
          {
            uri: '/api/*',
            allowAnonymous: false,
          },
        ],
      },
    }),
    provideHttpClient(withInterceptors([authHttpInterceptorFn])),
  ],
};