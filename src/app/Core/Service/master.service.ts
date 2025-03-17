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
  getLocations(): Observable<any[]> {
    return this.http.get<any>(this.apiURL + 'locations');
  }

  searchBus(from: number, to: number, travelDate: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiURL}searchBus?fromLocation=${from}&toLocation=${to}&travelDate=${travelDate}`
    );
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
