import { Router } from "@angular/router";
import { AuthService } from "../services/auth.service";
import { inject } from "@angular/core";

export const adminGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAdmin()) {
    return true;
  }

  // Si es un usuario común intentando entrar a ruta de admin, 
  // lo mandamos al dashboard normal
  return router.parseUrl('/dashboard');
};