import { HttpInterceptorFn } from '@angular/common/http';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  // Obtener el token del localStorage
  const userData = localStorage.getItem('redBusUser');
  const token = userData ? JSON.parse(userData).jwt : null;

  // Clonar la solicitud y agregar el header de autorización si existe el token
  if (token) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(authReq);
  }

  // Si no hay token, continuar con la solicitud original
  return next(req);
};