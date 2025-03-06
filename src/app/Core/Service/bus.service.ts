import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class BusService {
  apiUrl: string = 'http://localhost:5239/api/Buses/filter'; // Define the property
  constructor(private http: HttpClient) {} // Asegúrate de inyectarlo aquí

  getBusesByFilter(
    origen: string,
    destino: string,
    fechaIda: string,
    fechaRegreso?: string
  ): Observable<any> {
    let url = `${this.apiUrl}/buses/filter?origen=${origen}&destino=${destino}&fechaIda=${fechaIda}`;
    if (fechaRegreso) {
      url += `&fechaRegreso=${fechaRegreso}`;
    }
    return this.http.get<any>(url);
  }
  getBuses() {
    return this.http.get(this.apiUrl).pipe(
      catchError((error) => {
        console.error('Error en la API', error);
        return throwError(
          () => new Error('No se pudo obtener la información.')
        );
      })
    );
  }

  getSeatsByBus(busId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/buses/${busId}/seats`);
  }

  bookSeat(seatId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/seats/${seatId}/book`, {});
  }
}
