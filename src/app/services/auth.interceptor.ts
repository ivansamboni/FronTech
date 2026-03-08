import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // Si la URL es la del login, no inyectamos el token
  if (req.url.includes('/users/login')) {
    return next(req);
  }

  const authReq = token
    ? req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`),
      })
    : req;

    return next(authReq).pipe(

      catchError((error) => {
  
        if (error.status === 401) {
  
          authService.logout();  
        }  
        return throwError(() => error);  
      }),  
    );
};