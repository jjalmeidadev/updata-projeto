import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAuth0, authHttpInterceptorFn } from '@auth0/auth0-angular';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authHttpInterceptorFn])),
    provideAuth0({
      domain: 'dev-6imaiajbfe843lz7.us.auth0.com',
      clientId: 'zbxc9LxumO8vWmoyqglAVCv4PTiRwdKB',
      authorizationParams: {
        redirect_uri: window.location.origin + '/login',
        audience: 'https://api.updata.com',
      },
      httpInterceptor: {
        allowedList: ['/api/*', 'http://localhost:3000/api/*'],
      },
    }),
  ],
};