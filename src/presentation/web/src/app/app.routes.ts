import { Routes } from '@angular/router';
import { authGuardFn } from '@auth0/auth0-angular';
import { internalUserGuard } from './guards/internal-user.guard';
import { instanceLinkAuthGuard } from './guards/instance-link-auth.guard';
import { LoginComponent } from './pages/login/login.component';
import { SignupComponent } from './pages/signup/signup.component';
import { HomeComponent } from './pages/home/home.component';
import { OnboardingFormComponent } from './onboarding-form/onboarding-form.component';
import { UploadComponent } from './pages/upload/upload.component';
import { ModuleSelectorComponent } from './pages/module-selector/module-selector.component';
import { ReviewComponentsComponent } from './pages/review/review-components';
import { InputMethodComponent } from './pages/input-method/input-method.component';
import { OnboardingIntroComponent } from './pages/onboarding-intro/onboarding-intro.component';
import { EquiemReviewComponent } from './pages/equiem-review/equiem-review.component';
import { EquiemReviewDetailComponent } from './pages/equiem-review-detail/equiem-review-detail.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'onboarding-intro', component: OnboardingIntroComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'home', component: HomeComponent, canActivate: [authGuardFn, internalUserGuard] },
  { path: 'monitoring', component: HomeComponent, canActivate: [authGuardFn, internalUserGuard] },
  { path: 'company/:companyId', component: ModuleSelectorComponent, canActivate: [authGuardFn, internalUserGuard] },
  { path: 'module-selector/:linkToken', component: ModuleSelectorComponent, canActivate: [authGuardFn, internalUserGuard] },
  {
    path: 'form',
    component: OnboardingFormComponent,
    canActivate: [authGuardFn, internalUserGuard],
    data: { routeAnimation: 'form' },
  },
  { path: 'upload', component: UploadComponent, canActivate: [authGuardFn, internalUserGuard] },
  { path: 'review', component: ReviewComponentsComponent, canActivate: [authGuardFn, internalUserGuard] },
  { path: 'module-selector', component: ModuleSelectorComponent, canActivate: [authGuardFn, internalUserGuard] },
  {
    path: 'input-method',
    component: InputMethodComponent,
    canActivate: [authGuardFn, internalUserGuard],
    data: { routeAnimation: 'inputMethod' },
  },
  { path: 'onboarding/:linkToken', component: OnboardingIntroComponent, canActivate: [instanceLinkAuthGuard] },
  { path: 'onboarding/:linkToken/input-method', component: InputMethodComponent, canActivate: [instanceLinkAuthGuard] },
  { path: 'onboarding/:linkToken/form', component: OnboardingFormComponent, canActivate: [instanceLinkAuthGuard] },
  { path: 'onboarding/:linkToken/upload', component: UploadComponent, canActivate: [instanceLinkAuthGuard] },
  { path: 'onboarding/:linkToken/review', component: ReviewComponentsComponent, canActivate: [instanceLinkAuthGuard] },
  {path: 'equiem-review',component: EquiemReviewComponent,canActivate: [authGuardFn, internalUserGuard]},
  {path: 'equiem-review/:linkToken',component: EquiemReviewDetailComponent,canActivate: [authGuardFn, internalUserGuard]},
  { path: '**', redirectTo: '/login' },
];
