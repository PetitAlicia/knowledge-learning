import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private authService: AuthService) {}

  // Get all courses.
  getCourses(): Observable<any> {
    console.log("Appel de getCourses dans CourseService.");
    const headers = this.authService.getHeaders();
    console.log('Les en-têtes envoyés pour GET /courses :', headers); 
    return this.http.get(`${this.apiUrl}/courses`, { headers });
  }
  
  // Get all lessons.
  getLessons(): Observable<any> {
    const headers = this.authService.getHeaders();
    console.log('Les en-têtes envoyés avec la requête GET pour les leçons :', headers);
    return this.http.get(`${this.apiUrl}/courses/lessons`, { headers });
  }

  // Get a specific lesson.
  getLessonById(lessonId: string): Observable<any> {
    const headers = this.authService.getHeaders();
    return this.http.get(`${this.apiUrl}/courses/lesson/${lessonId}`, { headers });
  }

  // Check if the lesson has been bought.
  checkIfUserHasPurchased(lessonId: string): Observable<any> {
    const headers = this.authService.getHeaders();
    return this.http.get(`${this.apiUrl}/orders/check-purchase/${lessonId}`, { headers });
  }
  
  // Buy a course or a lesson.
  purchaseItem(cursusId?: string, lessonId?: string): Observable<any> {
    const headers = this.authService.getHeaders();
    console.log(`Envoi de la requête d'achat, cursusId : ${cursusId}, lessonId : ${lessonId}`);
    return this.http.post(`${this.apiUrl}/orders/purchase`, { cursusId, lessonId }, { headers });
  }
  
  // Check if the lesson has been validated.
  checkIfUserHasCompletedLesson(lessonId: string): Observable<any> {
    const headers = this.authService.getHeaders();
    return this.http.get(`${this.apiUrl}/courses/check-completion/${lessonId}`, { headers });
  }

  // Validate the lesson.
  completeLesson(lessonId: string): Observable<any> {
    const headers = this.authService.getHeaders();
    const userId = this.authService.getUserId();

    console.log(`Envoi de la requête pour valider la leçon ${lessonId} à ${this.apiUrl}/courses/complete-lesson/${lessonId}`);

    return this.http.post(`${this.apiUrl}/courses/complete-lesson/${lessonId}`, { user: userId, lesson: lessonId }, { headers });
  }

  // Check if the course has been bought.
  checkIfUserHasPurchasedCourse(courseId: string) {
    const headers = this.authService.getHeaders();
    return this.http.get<{ purchased: boolean }>(`${this.apiUrl}/orders/check-course-purchase/${courseId}`, { headers });
  }

  // Check if the course has been validated.
  checkIfCursusIsCompleted(courseId: string): Observable<any> {
    const headers = this.authService.getHeaders();
    return this.http.get<{ completed: boolean }>(`${this.apiUrl}/courses/check-cursus-completion/${courseId}`, { headers });
  }
}
