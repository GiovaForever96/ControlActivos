import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const AuthGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = localStorage.getItem('token');

  if (token) return true;

  return router.createUrlTree(['/']);
};

export const RoleGuard: CanActivateFn = (route) => {
  const router = inject(Router);

  const token = localStorage.getItem('token');
  if (!token) {
    return router.createUrlTree(['/']);
  }

  const rolesStorage = localStorage.getItem('roles');
  const userRoles: string[] = rolesStorage
    ? rolesStorage.split(',').map(r => r.trim())
    : [];

  const allowedRoles: string[] = route.data?.['roles'] || [];

  const tienePermiso = allowedRoles.some(rol => userRoles.includes(rol));
  console.log(tienePermiso);
  if (tienePermiso) {
    return true;
  }

  return router.createUrlTree(['/home/index']);
};