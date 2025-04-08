import { Component, OnInit } from '@angular/core';
import { CertificationService } from '../certification.service';
import { CommonModule, DatePipe } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  standalone: true,
  selector: 'app-certifications',
  imports: [CommonModule, DatePipe, HeaderComponent, FooterComponent],
  templateUrl: './certifications.component.html',
  styleUrls: ['./certifications.component.scss']
})
export class CertificationsComponent implements OnInit {
  certifications: any[] = [];
  errorMessage: string = '';

  constructor(private certificationService: CertificationService) {}

  ngOnInit() {
    this.loadCertifications();
  }

  // Get an user's certifications.
  loadCertifications() {
    this.certificationService.getUserCertifications().subscribe({
      next: (data) => {
        this.certifications = data;
      },
      error: (err) => {
        console.error('Il y a eu une erreur lors de la récupération des certifications.', err);
        this.errorMessage = 'Impossible de récupérer vos certifications.';
      }
    });
  }
}
