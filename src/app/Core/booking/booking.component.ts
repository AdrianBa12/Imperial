import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MasterService } from '../Service/master.service';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from "../component/navbar/navbar.component";
import { FooterComponent } from "../component/footer/footer.component";
import { jsPDF } from 'jspdf';
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
        this.procesandoPago = false;
        return;
      }

      const loggedUserDat = localStorage.getItem('redBusUser');
      if (!loggedUserDat) {
        alert('Por favor inicie sesión para realizar una reserva');
        this.procesandoPago = false;
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
      this.generarPDF(reservasCreadas);

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
  
 

generarPDF(reservas: any[]) {
  const doc = new jsPDF();

  // Logo (opcional)
  // doc.addImage(logoData, 'JPEG', 10, 10, 50, 20);

  // Título
  doc.setFontSize(18);
  doc.setTextColor(40);
  doc.text('COMPROBANTE DE COMPRA', 105, 20, { align: 'center' });

  // Fecha
  doc.setFontSize(12);
  doc.text(`Fecha: ${new Date().toLocaleDateString('es-PE')}`, 105, 30, { align: 'center' });

  // Información del viaje
  doc.setFontSize(14);
  doc.text('INFORMACIÓN DEL VIAJE', 14, 45);
  doc.setFontSize(12);
  doc.text(`Ruta: ${this.scheduleData.terminalSalidaId.nombreTerminal} - ${this.scheduleData.terminalLlegadaId.nombreTerminal}`, 14, 55);
  doc.text(`Fecha: ${this.scheduleData.fechaDeSalida}`, 14, 65);
  doc.text(`Hora: ${this.scheduleData.horaDeSalida}`, 14, 75);
  doc.text(`Duración: ${this.scheduleData.duracionEnHoras} horas`, 14, 85);

  // Pasajeros
  doc.setFontSize(14);
  doc.text('DETALLE DE PASAJEROS', 14, 100);

  // Cabecera de tabla
  doc.setFillColor(245, 245, 245);
  doc.rect(14, 105, 180, 10, 'F');
  doc.setTextColor(0);
  doc.setFontSize(12);
  doc.text('Asiento', 20, 112);
  doc.text('Nombre', 50, 112);
  doc.text('Documento', 120, 112);
  doc.text('Precio', 170, 112);

  // Contenido de tabla
  let y = 120;
  this.userSelectedSeatArray.forEach(pasajero => {
    doc.text(pasajero.seatNo.toString(), 20, y);
    doc.text(pasajero.nombreCompleto || 'SIN NOMBRE', 50, y);
    doc.text(`${pasajero.tipoDocumento} ${pasajero.numeroDocumento}`, 120, y);
    doc.text(`S/. ${this.scheduleData.precio.toFixed(2)}`, 170, y);
    y += 10;
  });

  // Total
  doc.setFontSize(16);
  doc.text(`TOTAL: S/. ${(this.scheduleData.precio * this.userSelectedSeatArray.length).toFixed(2)}`, 14, y + 20);

  // Pie de página
  doc.setFontSize(10);
  doc.text('Gracias por su compra. Presente este comprobante al abordar el bus.', 105, y + 40, { align: 'center' });
  doc.text(`Número de reserva: ${reservas[0]?.data?.bookingId || 'N/A'}`, 105, y + 45, { align: 'center' });

  // Guardar PDF
  doc.save(`Comprobante_${new Date().toISOString().slice(0, 10)}.pdf`);

  // Mostrar alerta de éxito
  alert('¡Pago y reserva completados con éxito! Se ha descargado el comprobante.');
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