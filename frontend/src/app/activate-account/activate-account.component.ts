import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  standalone: true,
  selector: 'app-activate-account',
  imports: [HeaderComponent, FooterComponent],
  templateUrl: './activate-account.component.html',
  styleUrls: ['./activate-account.component.scss']
})
export class ActivateAccountComponent implements OnInit {
  message: string = "Activation en cours...";

  constructor(private route: ActivatedRoute, private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    const token = this.route.snapshot.paramMap.get('token');
    if (token) {
      this.http.get(`${environment.apiUrl}/auth/activate/${token}`).subscribe({
        next: (response: any) => {
          this.message = response.message;
          setTimeout(() => this.router.navigate(['/login']), 3000);
        },
        error: () => {
          this.message = "Le lien est invalide ou expiré.";
        }
      });
    } else {
      this.message = "Le token d'activation est manquant.";
    }
  }
}
