import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const AuthGuard: CanActivateFn = (route, state) => {

  const isLoggedIn = checkLoginState();
  if (isLoggedIn) {
    return true;
  } else {
    return inject(Router).createUrlTree(['/']);
  }

};

function checkLoginState(): boolean {
  const token = localStorage.getItem('token');
  return !!token;
}