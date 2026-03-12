import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router'; // 🔹 Importa o Router

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  email = '';
  password = '';

  constructor(private router: Router) {} // 🔹 Injeta o Router

  login(f: NgForm) {
    if (f.valid) {
      console.log('Login com email:', this.email);
      // Navega para /home quando o formulário for válido
      this.router.navigate(['/home']);
    } else {
      console.log('Formulário inválido');
    }
  }
}