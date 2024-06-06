import { Injectable } from '@angular/core';
// Import the functions you need from the SDKs you need
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { initializeApp } from 'firebase/app';
import {
  GoogleAuthProvider,
  browserPopupRedirectResolver,
  getAuth,
  signInWithPopup,
} from 'firebase/auth';
import { BehaviorSubject } from 'rxjs';
import { firebaseConfig } from '../app.module';
import { DatabaseService } from './database.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private fireAuth: AngularFireAuth,
    private databaseService: DatabaseService,
    private router: Router
  ) {
    this.authStatusListener();
  }

  public user$ = new BehaviorSubject<any | undefined>(undefined);
  public permissions$ = new BehaviorSubject<any | undefined>(undefined);

  private authStatusListener(): void {
    this.fireAuth.onAuthStateChanged(async (credential) => {
      if (credential) {
        const user = {
          id: credential?.uid,
          email: credential?.email,
          name: credential?.displayName,
          photoUrl: credential?.photoURL,
        };
        if (credential.email) {
          this.databaseService.setData('users', user.id, user);
        }
        this.user$.next(user);
        this.setSessionUser();
      } else {
        if (this.validateSessionUser(sessionStorage.getItem('user')!)) {
          const user = JSON.parse(
            JSON.parse(sessionStorage.getItem('user')!).user
          );
          this.user$.next(user);
        }
        this.user$.next(undefined);
      }
    });
  }

  private setSessionUser(): void {
    const expiredAt = new Date();
    expiredAt.setHours(expiredAt.getHours() + 24);

    const user = {
      user: JSON.stringify(this.user$.getValue()),
      expiredAt: expiredAt.toISOString(),
    };
    sessionStorage.setItem('user', JSON.stringify(user));
  }

  public validateSessionUser(user: string): boolean {
    const sessionUser = user ? JSON.parse(user) : null;

    if (sessionUser !== null) {
      const expiredAt = new Date(sessionUser.expiredAt);
      if (expiredAt < new Date()) {
        return false;
      }
      return true;
    }
    return false;
  }

  public login(): void {
    const app = initializeApp(firebaseConfig);
    const provider = new GoogleAuthProvider();

    const auth = getAuth(app);
    signInWithPopup(auth, provider, browserPopupRedirectResolver)
      .then(() => {
        this.router.navigate(['/start']);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        const credential = GoogleAuthProvider.credentialFromError(error);
        console.error(errorCode, errorMessage, credential);
      });
  }

  public async logout(): Promise<void> {
    this.fireAuth.signOut();
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }
}
