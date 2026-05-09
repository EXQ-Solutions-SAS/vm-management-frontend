import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const cloned = req.clone({
    withCredentials: true // Esto es lo que permite que el JWT en la cookie viaje
  });
  return next(cloned);
};