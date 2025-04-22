import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
interface Encomienda {
  id: number;
  documentId: string;
  documentoEmisor: string;
  NombreCompletoEmisor: string;
  celularEmisor: string;
  documentoReceptor: string;
  nombreCompletoReceptor: string;
  celularReceptor: string;
  estadoPago: string;
  pesoKg: number;
  montoCobrar: number;
  estadoDeEntrega: string;
  // ... otros campos que necesites
}

interface ApiResponse {
  data: Encomienda[];
  meta: any;
}
@Injectable({
  providedIn: 'root',
})
export class MasterService {

  private apiURL: string = 'https://automatic-festival-37ec7cc8d8.strapiapp.com/api/';
  private authURL: string = 'https://automatic-festival-37ec7cc8d8.strapiapp.com/api/auth/';
  private apiPeruToken = '25222079ce57429371cf6d908d8b283966aad65f8e64caf50c2fff09a5727ce6';
  private apiUrl = 'https://apiperu.dev/api/dni/';
  constructor(private http: HttpClient) { }


  getProvincias(): Observable<any[]> {
    return this.http.get<any>(this.apiURL + 'provincias');
  }


  searchBus(from: number, to: number, travelDate: string): Observable<any> {
    // Construye los parámetros correctamente para Strapi v5
    let params = new HttpParams()
      .set('filters[terminalSalidaId][provinciaId][id][$eq]', from.toString())
      .set('filters[terminalLlegadaId][provinciaId][id][$eq]', to.toString())
      .set('filters[fechaDeSalida][$gte]', new Date(travelDate).toISOString())
      .set('filters[fechaDeSalida][$lt]', new Date(new Date(travelDate).getTime() + 86400000).toISOString()) // +1 día
      .set('populate[0]', 'terminalSalidaId.provinciaId')
      .set('populate[1]', 'terminalLlegadaId.provinciaId')
      .set('populate[2]', 'bus')
      .set('populate[3]', 'conductor')
      .set('populate[4]', 'terminalSalidaId')
      .set('populate[5]', 'terminalLlegadaId');

    return this.http.get<any>(`${this.apiURL}horario-de-autobuses`, { params });
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
      fullName: obj.fullName,  // Asegurar que coincide con el nombre en Strapi
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



  buscarPorDNI(dni: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.apiPeruToken}`,

    });

    return this.http.get<any>(`${this.apiUrl}${dni}`, { headers });
  }
  // En master.service.ts

  // Método para crear reservas
  // En master.service.ts
  crearReserva(datosReserva: any): Observable<any> {
    return this.http.post(`${this.apiURL}reservas`, {
      data: {
        ...datosReserva,
        // Asegurar que el usuario se envíe como relación
        usuario: datosReserva.usuario
      }
    });
  }

  // Método para actualizar el mapa de asientos
  actualizarMapaAsientos(documentId: string, mapaAsientos: any[]): Observable<any> {
    return this.http.put(`${this.apiURL}horario-de-autobuses/${documentId}`, {
      data: {
        mapaDeAsientos: mapaAsientos
      }
    });
  }
  
  getEncomiendasByDni(dni: string): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(
      `${this.apiURL}encomiendas?filters[$or][0][documentoEmisor][$eq]=${dni}&filters[$or][1][documentoReceptor][$eq]=${dni}`
    );
  }

}