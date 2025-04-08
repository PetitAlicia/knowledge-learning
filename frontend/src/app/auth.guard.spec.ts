import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthGuard } from './auth.guard';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

describe('AuthGuard', () => {
  let authGuard: AuthGuard;
  let authService: AuthService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [AuthGuard, AuthService]
    });
    
    authGuard = TestBed.inject(AuthGuard);
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  it('should be created', () => {
    expect(authGuard).toBeTruthy();
  });

  it('should allow access if token exists and role is client', () => {
    localStorage.setItem('token', 'valid-token');

    spyOn(authService, 'isAuthenticated').and.returnValue(true);

    const next = {} as ActivatedRouteSnapshot;
    const state = {} as RouterStateSnapshot;

    expect(authGuard.canActivate(next, state)).toBeTrue();
  });

  it('should redirect to login if no token', () => {
    localStorage.removeItem('token');

    spyOn(router, 'navigate');
    
    const next = {} as ActivatedRouteSnapshot;
    const state = {} as RouterStateSnapshot;

    expect(authGuard.canActivate(next, state)).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
