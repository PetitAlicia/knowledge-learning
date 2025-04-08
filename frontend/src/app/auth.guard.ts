import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = token.split('.')[1];
        const decoded = JSON.parse(atob(payload));

        if (decoded && decoded.role === 'client') {
          return true;
        } else {
          this.router.navigate(['/login']);
          return false;
        }
      } catch (error) {
        console.error('Il y a eu une erreur lors du décodage du token :', error);
        this.router.navigate(['/login']);
        return false;
      }
    }

    this.router.navigate(['/login']);
    return false;
  }
}
