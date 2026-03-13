import { Routes } from '@angular/router';
import { authGuardFn } from '@auth0/auth0-angular';
import { LoginComponent } from './pages/login/login.component';
import { SignupComponent } from './pages/signup/signup.component';
import { HomeComponent } from './pages/home/home.component';
import { OnboardingFormComponent } from './onboarding-form/onboarding-form.component';
import { UploadComponent } from './pages/upload/upload.component';
import { ModuleSelectorComponent } from './pages/module-selector/module-selector.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'home', component: HomeComponent, canActivate: [authGuardFn] },
  { path: 'form', component: OnboardingFormComponent, canActivate: [authGuardFn] },
  { path: 'upload', component: UploadComponent, canActivate: [authGuardFn] },
  { path: 'module-selector', component: ModuleSelectorComponent, canActivate: [authGuardFn] },
  { path: '**', redirectTo: '/login' }
];