import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class BusesService {
  private apiUrl = 'http://localhost:5239/api/buses'; // Ajusta la URL de la API

  constructor(private http: HttpClient) {}

  getBuses(
    origen: string,
    destino: string,
    fechaIda: string,
    fechaRegreso?: string
  ): Observable<any> {
    let url = `${this.apiUrl}/filter?origen=${origen}&destino=${destino}&fechaIda=${fechaIda}`;
    if (fechaRegreso) {
      url += `&fechaRegreso=${fechaRegreso}`;
    }
    return this.http.get(url);
  }

  getSeats(busId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${busId}/seats`);
  }
}
