import { HttpInterceptorFn } from '@angular/common/http';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  // Excluir API externa
  if (req.url.includes('apiperu.dev')) {
    return next(req);
  }

  const userData = localStorage.getItem('redBusUser');
  const token = userData ? JSON.parse(userData).jwt : null;

  if (token) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(authReq);
  }

  return next(req);
};