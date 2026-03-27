import { Routes } from '@angular/router';
import { authGuardFn } from '@auth0/auth0-angular';
import { LoginComponent } from './pages/login/login.component';
import { SignupComponent } from './pages/signup/signup.component';
import { HomeComponent } from './pages/home/home.component';
import { OnboardingFormComponent } from './onboarding-form/onboarding-form.component';
import { UploadComponent } from './pages/upload/upload.component';
import { ModuleSelectorComponent } from './pages/module-selector/module-selector.component';
import { ReviewComponentsComponent } from './pages/review/review-components';
import { InputMethodComponent } from './pages/input-method/input-method.component';
import { OnboardingIntroComponent } from './pages/onboarding-intro/onboarding-intro.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'onboarding-intro', component: OnboardingIntroComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'home', component: HomeComponent, canActivate: [authGuardFn] },
  {
    path: 'form',
    component: OnboardingFormComponent,
    data: { routeAnimation: 'form' },
  },
  { path: 'upload', component: UploadComponent },
  { path: 'review', component: ReviewComponentsComponent },
  { path: 'module-selector', component: ModuleSelectorComponent, canActivate: [authGuardFn] },
  {
    path: 'input-method',
    component: InputMethodComponent,
    data: { routeAnimation: 'inputMethod' },
  },
  { path: '**', redirectTo: '/login' }
];
