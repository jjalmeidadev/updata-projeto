import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
})
export class SignupComponent {
  name = '';
  email = '';
  password = '';

  constructor(private router: Router) {}

  register() {
    // TODO: hook up real registration
    console.log('register with name:', this.name, 'email:', this.email);
    // After registration, navigate to login
    this.router.navigate(['/login']);
  }
}