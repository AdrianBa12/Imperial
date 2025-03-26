import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MasterService {

  apiURL: string = 'http://localhost:1337/api/';
  authURL: string = 'http://localhost:1337/api/auth/';

  constructor(private http: HttpClient) {}


  getProvincias(): Observable<any[]> {
    return this.http.get<any>(this.apiURL + 'provincias');
  }


  searchBus(from: number, to: number, travelDate: string): Observable<any[]> {
    const params = {
      'filters[terminalSalidaId][provinciaId][$in][0]': from,
      'filters[terminalLlegadaId][provinciaId][$in][0]': to,
      'filters[fechaDeSalida][$eq]': travelDate,
      'populate[terminalSalidaId][populate][0]': 'provinciaId',
      'populate[terminalLlegadaId][populate][0]': 'provinciaId',
    };
  
    return this.http.get<any[]>(`${this.apiURL}horario-de-autobuses`, { params });
  }

  getScheduleById(documentId: string): Observable<any> {
    return this.http.get<any>(`${this.apiURL}horario-de-autobuses/${documentId}?populate=*`);
  }
  
  getAllBusBookings(id: number) {
    return this.http.get<any[]>(
      this.apiURL + 'GetAllBusBookings?vendorId=' + id
    );
  }

  GetBusSchedules(id: number) {
    return this.http.get<any[]>(
      this.apiURL + 'GetAllBusBookings?vendorId=' + id
    );
  }

  getBookedSeats(id: number) {
    return this.http.get<any[]>(
      this.apiURL + 'getBookedSeats?scheduleId=' + id
    );
  }

  onRegisterUser(obj: any): Observable<any> {
    const userData = {
      username: obj.userName,  // Asegurar que coincide con el nombre en Strapi
      email: obj.emailId,      // Strapi espera 'email' no 'emailId'
      password: obj.password,
      role: '3'                // Rol como string
    };
    
    // Enviar el objeto directamente, sin envolver en {data: ...}
    return this.http.post(`${this.apiURL}users`, userData);
  }

  onBooking(obj: any) {
    return this.http.post<any[]>(this.apiURL + 'PostBusBooking', obj);
  }

  onRegisterVendor(obj: any): Observable<any> {
    return this.http.post(`${this.apiURL}/CreateVendor`, obj);
  }

  onLogin(obj: any): Observable<any> {
    return this.http.post(`${this.authURL}local`, {
      identifier: obj.userName, // Puede ser email o username
      password: obj.password
    });
  }

  createSchedule(obj: any): Observable<any> {
    return this.http.post(`${this.apiURL}/PostBusSchedule`, obj);
  }
}
