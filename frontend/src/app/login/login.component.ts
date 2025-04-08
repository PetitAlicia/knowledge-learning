import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [FormsModule, HeaderComponent, RouterModule, FooterComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  email: string = '';
  password: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  login() {
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (response) => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('userId', response.user._id);
        alert('La connexion a réussie !');
        this.router.navigate(['/courses']);
      },
      error: (error) => {
        if (error.status === 403 && error.error.message === "Le compte n'a pas été activé.") {
          alert("Veuillez activer votre compte pour vous connecter.");
        } else {
          alert("Il y a eu une erreur de connexion.");
        }
      }
    });
  }
}
