import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CourseService } from '../course.service';
import { AuthService } from '../auth.service';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser'; 

@Component({
  standalone: true,
  selector: 'app-lesson-page',
  imports: [CommonModule, HeaderComponent, FooterComponent],
  templateUrl: './lesson-page.component.html',
  styleUrls: ['./lesson-page.component.scss']
})
export class LessonPageComponent implements OnInit {
  lessonId!: string;
  lesson: any;
  isPurchased: boolean = false;
  isLessonCompleted: boolean = false;
  lessonContent!: SafeHtml;

  constructor(
    private route: ActivatedRoute,
    private courseService: CourseService,
    private authService: AuthService,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.lessonId = this.route.snapshot.paramMap.get('id')!;
    this.getLessonDetails(this.lessonId);
  }

  // Get a specific lesson.
  getLessonDetails(lessonId: string): void {
    this.courseService.getLessonById(lessonId).subscribe(
      (lesson) => {
        this.lesson = lesson;
        this.lessonContent = this.sanitizer.bypassSecurityTrustHtml(this.lesson.content);
        console.log(this.lessonContent);
        this.checkIfPurchased();
        this.checkIfLessonCompleted();
      },
      (error) => {
        console.error("Il y a eu une erreur lors de la récupération de la leçon.", error);
        this.router.navigate(['/courses']);
      }
    );
  }

  // Check if the user has bought the lesson.
  checkIfPurchased(): void {
    if (this.authService.isAuthenticated()) { 
      this.courseService.checkIfUserHasPurchased(this.lessonId).subscribe(
        (response) => {
          this.isPurchased = response.purchased;
        },
        (error) => {
          console.error("Il y a eu une erreur lors de la vérification de l'achat.", error);
        }
      );
    } else {
      this.router.navigate(['/login']);
    }
  }

  // Check if the user has validated the lesson.
  checkIfLessonCompleted(): void {
    this.courseService.checkIfUserHasCompletedLesson(this.lessonId).subscribe(
      (response) => {
        this.isLessonCompleted = response.completed ?? true;
        console.log("Après la validation :", this.isLessonCompleted);
      },
      (error) => {
        console.error("Il y a eu une erreur lors de la vérification de la validation de la leçon.", error);
      }
    );
  }

  // Validate the lesson.
  validateLesson(): void {
    console.log("Validation de la leçon :", this.lessonId);
    this.courseService.completeLesson(this.lessonId).subscribe(
        (response) => {
            console.log("La réponse de validation reçue :", response);
            alert("La leçon a été validée avec succès !");
            this.isLessonCompleted = true;

            if (response.certificationGranted) {
              alert("Félicitations ! Vous avez obtenu une certification pour ce thème !");
          }
        },
        (error) => {
            console.error("Il y a eu une erreur lors de la validation de la leçon :", error);
            alert("Il y a eu une erreur lors de la validation de la leçon.");
        }
    );
}
}
