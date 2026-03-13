import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { filter, take } from 'rxjs/operators';

type UserFlowResponse = { next: string };

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.auth.isAuthenticated$
      .pipe(filter(Boolean), take(1))
      .subscribe(() => this.resolveUserFlow());
  }

  login(): void {
    this.auth.loginWithRedirect();
  }

  loginWithGoogle(): void {
    this.auth.loginWithRedirect({
      authorizationParams: { connection: 'google-oauth2' },
    });
  }

  private resolveUserFlow(): void {
    this.http.get<UserFlowResponse>('/api/users').subscribe({
      next: ({ next }) => this.router.navigateByUrl(next || '/home'),
      error: err => {
        if (err.status === 403) this.router.navigateByUrl('/home');
        else if (err.status === 404) this.router.navigateByUrl('/signup');
        else this.router.navigateByUrl('/home');
      },
    });
  }
}