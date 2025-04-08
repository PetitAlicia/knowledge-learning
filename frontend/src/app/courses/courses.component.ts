import { Component, OnInit } from '@angular/core';
import { CourseService } from '../course.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  standalone: true,
  selector: 'app-courses',
  imports: [CommonModule, RouterModule, HeaderComponent, FooterComponent],
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.scss']
})
export class CoursesComponent implements OnInit {
  courses: any[] = [];
  lessons: any[] = [];
  lessonStatus: { [key: string]: boolean } = {}; 
  cursusCompletionStatus: { [key: string]: boolean } = {};
  lessonPurchaseStatus: { [key: string]: boolean } = {};

  constructor(private courseService: CourseService) {}

  ngOnInit() {
    console.log("Appel de ngOnInit.");
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('L\'utilisateur n\'a pas été authentifié. Redirection vers la page de connexion.');
      window.location.href = '/login';
      return;
    }
  
  // Get all courses.
    console.log("Appel de getCourses.");
    this.courseService.getCourses().subscribe({
      next: (data) => {
        console.log('Les données des cursus :', data);
        this.courses = data;
  
        this.courses.forEach(course => {
          this.courseService.checkIfCursusIsCompleted(course._id).subscribe({
            next: (response) => {
              this.cursusCompletionStatus[course._id] = response.completed;
            },
            error: (err) => {
              console.error(`Il y a eu une erreur lors de la vérification de la complétion du cursus ${course._id}`, err);
              this.cursusCompletionStatus[course._id] = false;
            }
          });
        });
      },
      error: (err) => console.error('Il y a eu une erreur lors de la récupération des cursus :', err)
    });

  // Get all lessons.
  this.courseService.getLessons().subscribe({
    next: (data) => {
      console.log('Les données des leçons :', data);
      this.lessons = data;

      this.lessons.forEach(lesson => {
        this.courseService.checkIfUserHasCompletedLesson(lesson._id).subscribe({
          next: () => {
            this.lessonStatus[lesson._id] = true;
          },
          error: () => {
            this.lessonStatus[lesson._id] = false;
          }
        });

        this.courseService.checkIfUserHasPurchased(lesson._id).subscribe({
          next: (response) => {
            this.lessonPurchaseStatus[lesson._id] = response.purchased;
          },
          error: () => {
            this.lessonPurchaseStatus[lesson._id] = false;
          }
        });
      });
    },
    error: (err) => console.error('Il y a eu une erreur lors de la récupération des leçons :', err)
  });
}

  // Get the lessons from a course.
  getLessonsForCourse(courseId: string) {
    return this.lessons.filter(lesson => lesson.cursus?._id === courseId);
  }

  // Buy a course.
  buyCourse(course: any) {
    this.courseService.checkIfUserHasPurchasedCourse(course._id).subscribe((response) => {
      console.log('La réponse de la vérification de l\'achat :', response);
      if (response.purchased) {
        alert("Vous avez déjà acheté ce cursus.");
      } else {
        this.courseService.purchaseItem(course._id).subscribe({
          next: (purchaseResponse) => {
            console.log(`L'achat a été réussi : ${course.title}`, purchaseResponse);
            alert(`Vous avez acheté le cursus : ${course.title}`);

            this.buyLessonsForCourse(course._id);
          },
          error: (err) => {
            console.error("Il y a eu une erreur lors de l'achat du cursus.", err);
            alert("Il y a eu une erreur lors de l'achat du cursus.");
          }
        });
      }
    });
  }
  
  // Get access to all the of lessons from a course when it's bought.
  buyLessonsForCourse(courseId: string) {
    const lessonsForCourse = this.getLessonsForCourse(courseId);

    lessonsForCourse.forEach(lesson => {
      this.courseService.checkIfUserHasPurchased(lesson._id).subscribe((response) => {
        if (!response.purchased) {
          this.courseService.purchaseItem(undefined, lesson._id).subscribe({
            next: () => {
              console.log(`L'achat a été réussi pour la leçon : ${lesson.title}`);
              alert(`Vous avez acheté la leçon : ${lesson.title}`);
            },
            error: (err) => {
              console.error("Il y a eu une erreur lors de l'achat de la leçon.", err);
              alert("Il y a eu une erreur lors de l'achat de la leçon.");
            }
          });
        }
      });
    });
  }
  
  // Buy a lesson.
  buyLesson(lesson: any) {
    this.courseService.checkIfUserHasPurchased(lesson._id).subscribe((response) => {
      if (response.purchased) {
        alert("Vous avez déjà acheté cette leçon.");
      } else {
        this.courseService.purchaseItem(undefined, lesson._id).subscribe({
          next: () => {
            console.log(`L'achat a été réussi pour la leçon : ${lesson.title}`);
            alert(`Vous avez acheté la leçon : ${lesson.title}`);
          },
          error: (err) => {
            console.error("Il y a eu une erreur lors de l'achat de la leçon.", err);
            alert("Il y a eu une erreur lors de l'achat de la leçon.");
          }
        });
      }
    });
  }  

  // Validate a lesson.
  completeLesson(lessonId: string) {
    this.courseService.completeLesson(lessonId).subscribe({
      next: () => {
        this.lessonStatus[lessonId] = true;
        alert("La leçon a été validée.");
      },
      error: (err) => {
        console.error("Il y a eu une erreur lors de la validation de la leçon.", err);
        alert("Il y a eu une erreur lors de la validation de la leçon.");
      }
    });
  }

  // Check if all lessons from a course have been bought.
  areAllLessonsPurchased(courseId: string): boolean {
    const lessonsForCourse = this.getLessonsForCourse(courseId);
    return lessonsForCourse.every(lesson => this.lessonPurchaseStatus[lesson._id]);
  }
}
