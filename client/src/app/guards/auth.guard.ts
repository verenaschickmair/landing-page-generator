import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard {
  constructor(private authService: AuthService, private router: Router) {}

  public canActivate(): boolean {
    const user = window.sessionStorage.getItem('user');

    if (user && this.authService.validateSessionUser(user)) {
      return true;
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }
}
