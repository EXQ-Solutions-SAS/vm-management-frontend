// src/app/core/guards/auth.guard.ts
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Si el signal del usuario tiene datos, está logueado
  if (authService.user()) {
    return true;
  }

  // Si no, al login de una
  return router.parseUrl('/login');
};