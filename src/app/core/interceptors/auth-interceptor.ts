import { HttpInterceptorFn, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { SessionService } from '../../servizi/session.service'; 


export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next) => {
  
  const router = inject(Router);
  const sessionService = inject(SessionService);

  // token
  const token = sessionService.getToken(); 

  console.log('Interceptor: token recuperato dal SessionService:', token);

  let reqWithToken = req;
  
  if (token) {

    reqWithToken = req.clone({
      headers: req.headers.set("Authorization", `Bearer ${token}`)
    });
  }

  return next(reqWithToken).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        console.warn('Token scaduto o invalido (401). Logout automatico.');
        
        if (sessionService.clearSession) {
           sessionService.clearSession();
        } else {
           localStorage.removeItem('token');
           localStorage.removeItem('loggedUtente');
        }
        
        router.navigate(['/scelta-ruolo']);
      }
      return throwError(() => error);
    })
  );

};