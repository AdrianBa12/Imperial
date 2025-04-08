import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MasterService } from '../Service/master.service';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from "../component/navbar/navbar.component";
import { FooterComponent } from "../component/footer/footer.component";

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [FormsModule, CommonModule, NavbarComponent, FooterComponent],
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.css']
})
export class BookingComponent {
  scheduleId: string = '';
  scheduleData: any;
  busInfo: any = {
    claseDeBus: '',
    placaBus: ''
  };
  formSubmitted: boolean = false;

  seatMap: any[] = [];
  userSelectedSeatArray: any[] = [];
  buscandoDNI: boolean = false;

  mostrarResumen: boolean = false;
  mostrarFormaPago: boolean = false;
  procesandoPago: boolean = false;
  datosTarjeta: any = {
    numero: '',
    nombre: '',
    expiracion: '',
    cvv: ''
  };

  minDate: Date = new Date();

  constructor(
    private activedRoute: ActivatedRoute,
    private masterSrv: MasterService
  ) {
    this.activedRoute.params.subscribe((res: any) => {
      this.scheduleId = res.id;
      this.getScheduleDetailsById();
    });
  }

  buscarDNI(index: number) {
    const dni = this.userSelectedSeatArray[index].numeroDocumento;

    if (!dni || dni.length !== 8) {
      alert('Por favor ingrese un DNI válido (8 dígitos exactos)');
      return;
    }

    this.buscandoDNI = true;

    this.masterSrv.buscarPorDNI(dni).pipe(
      finalize(() => this.buscandoDNI = false)
    ).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const pasajero = this.userSelectedSeatArray[index];
          pasajero.nombreCompleto = response.data.nombre_completo;
        } else {
          alert(response.message || 'No se encontraron datos para este DNI');
        }
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error al consultar DNI:', err);
        if (err.status === 401) {
          alert('Error de autenticación con el servicio de consulta DNI');
        } else if (err.status === 0) {
          alert('Error de conexión. Verifique su internet o intente más tarde.');
        } else {
          alert(`Error al consultar el DNI: ${err.error?.message || err.message || 'Error desconocido'}`);
        }
      }
    });
  }

  getScheduleDetailsById() {
    this.masterSrv.getScheduleById(this.scheduleId).subscribe({
      next: (res: any) => {
        this.scheduleData = res.data;
        this.seatMap = res.data.mapaDeAsientos;
        this.busInfo = {
          claseDeBus: res.data.claseDeBus,
          placaBus: res.data.placaBus
        };
      },
      error: (err) => {
        console.error('Error al obtener detalles del horario:', err);
        alert('Error al cargar los detalles del viaje');
      }
    });
  }

  checkSeatStatus(seatNo: number): string {
    const seat = this.seatMap.find(s => s.number === seatNo);
    if (!seat) return 'unknown';

    const isSelected = this.userSelectedSeatArray.some(item => item.seatNo === seatNo);
    if (isSelected) return 'selected';

    return seat.estado;
  }

  selectSeat(seatNo: number) {
    if (this.userSelectedSeatArray.length >= 4 && !this.isSeatSelected(seatNo)) {
      alert('Solo puedes seleccionar un máximo de 4 asientos');
      return;
    }

    const seat = this.seatMap.find(s => s.number === seatNo);
    if (seat?.estado === 'ocupado') return;

    const existingIndex = this.userSelectedSeatArray.findIndex(item => item.seatNo === seatNo);

    if (existingIndex === -1) {
      this.userSelectedSeatArray.push({
        passengerId: 0,
        bookingId: 0,
        seatNo: seatNo,
        tipoDocumento: 'dni',
        numeroDocumento: '',
        nombreCompleto: '',
        edad: null
      });
    } else {
      this.userSelectedSeatArray.splice(existingIndex, 1);
    }
  }

  setDocumentType(index: number, type: string) {
    this.userSelectedSeatArray[index].tipoDocumento = type;
    if (type === 'dni') {
      this.userSelectedSeatArray[index].nombreCompleto = '';
      this.userSelectedSeatArray[index].edad = null;
    }
  }

  removePassenger(index: number) {
    this.userSelectedSeatArray.splice(index, 1);
  }

  bookNow() {
    this.formSubmitted = true;

    if (this.userSelectedSeatArray.length === 0) {
      alert('Por favor seleccione al menos un asiento');
      return;
    }

    const datosIncompletos = this.userSelectedSeatArray.some(item => {
      if (!item.numeroDocumento) return true;
      if (item.tipoDocumento === 'dni' && item.numeroDocumento.length !== 8) return true;
      if (item.tipoDocumento === 'pasaporte' && item.numeroDocumento.length < 6) return true;
      if (!item.nombreCompleto || !item.edad && item.edad !== 0) return true;
      if (item.edad < 0 || item.edad > 120) return true;
      return false;
    });

    if (datosIncompletos) {
      alert('Por favor complete todos los campos requeridos con información válida');
      return;
    }

    this.mostrarResumen = true;
    this.mostrarFormaPago = false;
  }

  async confirmarPago() {
    this.procesandoPago = true;

    try {
      if (!this.datosTarjeta.numero || !this.datosTarjeta.nombre ||
        !this.datosTarjeta.expiracion || !this.datosTarjeta.cvv) {
        alert('Por favor complete todos los datos de la tarjeta');
        return;
      }

      const loggedUserDat = localStorage.getItem('redBusUser');
      if (!loggedUserDat) {
        alert('Por favor inicie sesión para realizar una reserva');
        return;
      }

      const loggData = JSON.parse(loggedUserDat);
      const userId = loggData.userId;

      // 1. Crear reservas
      const reservasPromesas = this.userSelectedSeatArray.map(pasajero => {
        const reservaData = {
          numeroDeasiento: pasajero.seatNo,
          nombreCompleto: pasajero.nombreCompleto || 'SIN NOMBRE',
          numeroDocumento: pasajero.numeroDocumento,
          tipoDocumento: pasajero.tipoDocumento,
          horario_de_autobus: this.scheduleId,
          usuario: userId
        };
        return this.masterSrv.crearReserva(reservaData).toPromise();
      });

      const reservasCreadas = await Promise.all(reservasPromesas);

      // 2. Actualizar mapa de asientos
      const nuevoMapaAsientos = this.seatMap.map(asiento => ({
        number: asiento.number,
        estado: this.userSelectedSeatArray.some(item => item.seatNo === asiento.number) ? 'ocupado' : asiento.estado
      }));

      await this.masterSrv.actualizarMapaAsientos(this.scheduleId, nuevoMapaAsientos).toPromise();

      // 3. Generar comprobante
      this.generarComprobante(reservasCreadas);

      // 4. Limpiar y resetear
      this.mostrarResumen = false;
      this.mostrarFormaPago = false;
      this.procesandoPago = false;
      this.getScheduleDetailsById();
      this.userSelectedSeatArray = [];
      this.formSubmitted = false;

    } catch (error) {
      console.error('Error en la reserva:', error);
      alert('Error al procesar el pago. Por favor intente nuevamente.');
      this.procesandoPago = false;
    }
  }

  generarComprobante(reservas: any[]) {
    const fecha = new Date().toLocaleDateString('es-PE', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    });
    
    const horaSalida = new Date(this.scheduleData.fechaDeSalida).toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const contenido = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Comprobante de Reserva - Imperial</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; color: #333; }
          .container { max-width: 800px; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #2563eb; }
          .logo { max-width: 180px; margin-bottom: 10px; }
          .title { color: #1e3a8a; font-size: 28px; font-weight: 700; margin: 10px 0; }
          .subtitle { color: #6b7280; font-size: 16px; margin-bottom: 5px; }
          .section { margin-bottom: 25px; }
          .section-title { 
            background-color: #2563eb; 
            color: white; 
            padding: 10px 15px; 
            font-weight: 600; 
            border-radius: 5px 5px 0 0;
            margin-bottom: 0;
          }
          .card { border: 1px solid #e5e7eb; border-radius: 5px; overflow: hidden; }
          .card-body { padding: 15px; }
          .info-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
          .info-table td { padding: 10px; border-bottom: 1px solid #e5e7eb; vertical-align: top; }
          .info-table tr:last-child td { border-bottom: none; }
          .passenger-table { width: 100%; border-collapse: collapse; }
          .passenger-table th { 
            background-color: #f3f4f6; 
            padding: 12px; 
            text-align: left; 
            font-weight: 600;
            color: #374151;
          }
          .passenger-table td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
          .total { 
            font-size: 20px; 
            font-weight: 700; 
            text-align: right; 
            margin-top: 25px;
            color: #1e3a8a;
          }
          .footer { 
            margin-top: 40px; 
            text-align: center; 
            font-size: 14px; 
            color: #6b7280;
            padding-top: 20px;
            border-top: 1px dashed #d1d5db;
          }
          .badge {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 500;
            background-color: #e0e7ff;
            color: #1e40af;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="title">COMPROBANTE DE RESERVA</div>
            <div class="subtitle">${fecha}</div>
          </div>

          <div class="section">
            <h3 class="section-title">INFORMACIÓN DEL VIAJE</h3>
            <div class="card">
              <div class="card-body">
                <table class="info-table">
                  <tr>
                    <td><strong>Ruta:</strong></td>
                    <td>${this.scheduleData.terminalSalidaId.nombreTerminal} → ${this.scheduleData.terminalLlegadaId.nombreTerminal}</td>
                  </tr>
                  <tr>
                    <td><strong>Fecha y Hora:</strong></td>
                    <td>${new Date(this.scheduleData.fechaDeSalida).toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' })} a las ${horaSalida}</td>
                  </tr>
                  <tr>
                    <td><strong>Duración:</strong></td>
                    <td>${this.scheduleData.duracionEnHoras} horas</td>
                  </tr>
                  <tr>
                    <td><strong>Bus:</strong></td>
                    <td>${this.busInfo.claseDeBus} (${this.busInfo.placaBus})</td>
                  </tr>
                </table>
              </div>
            </div>
          </div>

          <div class="section">
            <h3 class="section-title">DETALLE DE PASAJEROS</h3>
            <div class="card">
              <div class="card-body">
                <table class="passenger-table">
                  <thead>
                    <tr>
                      <th>Asiento</th>
                      <th>Nombre</th>
                      <th>Documento</th>
                      <th>Precio</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${this.userSelectedSeatArray.map(pasajero => `
                      <tr>
                        <td><span class="badge">${pasajero.seatNo}</span></td>
                        <td>${pasajero.nombreCompleto || 'SIN NOMBRE'}</td>
                        <td>${pasajero.tipoDocumento.toUpperCase()} ${pasajero.numeroDocumento}</td>
                        <td>S/. ${this.scheduleData.precio.toFixed(2)}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div class="total">
            TOTAL A PAGAR: S/. ${(this.scheduleData.precio * this.userSelectedSeatArray.length).toFixed(2)}
          </div>

          <div class="footer">
            <p>Gracias por viajar con Imperial. Presente este comprobante al abordar el bus.</p>
            <p>Número de reserva: ${reservas[0]?.data?.bookingId || 'N/A'}</p>
            <p>Para consultas o cambios, contacte a nuestro servicio al cliente.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([contenido], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Reserva_Imperial_${new Date().toISOString().slice(0, 10)}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    alert('¡Reserva completada con éxito! Se ha descargado el comprobante.');
  }

  isSeatSelected(seatNo: number): boolean {
    return this.userSelectedSeatArray.some(item => item.seatNo === seatNo);
  }

  formatCardNumber(event: any) {
    let value = event.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    let matches = value.match(/\d{4,16}/g);
    let match = matches && matches[0] || '';
    let parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    this.datosTarjeta.numero = parts.length ? parts.join(' ') : value;
  }

  formatExpiry(event: any) {
    let value = event.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (value.length > 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    this.datosTarjeta.expiracion = value;
  }

  formatCVV(event: any) {
    this.datosTarjeta.cvv = event.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  }
}