import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  standalone: true,
  selector: 'app-register',
  imports: [CommonModule, FormsModule, RouterModule, HeaderComponent, FooterComponent],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  user = { name: '', email: '', password: '' };
  errorMessage: string = '';
  successMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  register() {
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.register(this.user).subscribe({
      next: (response) => {
        this.successMessage = "L'inscription a réussie ! Vérifiez votre e-mail pour activer votre compte (n'oubliez pas de vérifier dans les 'spams' si aucun e-mail n'a été reçu !).";
        setTimeout(() => this.router.navigate(['/login']), 3000);
      },
      error: (error) => {
        this.errorMessage = error.error.message || "Une erreur est survenue.";
      }
    });
  }
}
