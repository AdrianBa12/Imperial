import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MasterService {
  // apiURL: string = 'https://projectapi.gerasim.in/api/BusBooking/';
  apiURL: string = 'http://localhost:1337/api/';

  constructor(private http: HttpClient) {}

  // getLocations(): Observable<any[]> {
  //   return this.http.get<any[]>(this.apiURL + 'GetBusLocations');
  // }
  getProvincias(): Observable<any[]> {
    return this.http.get<any>(this.apiURL + 'provincias');
  }

  // searchBus(from: number, to: number, travelDate: string): Observable<any[]> {
  //   return this.http.get<any[]>(
  //     `${this.apiURL}searchBus?fromLocation=${from}&toLocation=${to}&travelDate=${travelDate}`
  //   );
  // }
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

  getScheduleById(id: number) {
    return this.http.get<any[]>(this.apiURL + 'GetBusScheduleById?id=' + id);
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

  onRegisterUser(obj: any) {
    return this.http.post<any[]>(this.apiURL + 'AddNewUser', obj);
  }

  onBooking(obj: any) {
    return this.http.post<any[]>(this.apiURL + 'PostBusBooking', obj);
  }

  onRegisterVendor(obj: any): Observable<any> {
    return this.http.post(`${this.apiURL}/CreateVendor`, obj);
  }

  onLogin(obj: any): Observable<any> {
    return this.http.post(`${this.apiURL}/login`, obj);
  }

  createSchedule(obj: any): Observable<any> {
    return this.http.post(`${this.apiURL}/PostBusSchedule`, obj);
  }
}
