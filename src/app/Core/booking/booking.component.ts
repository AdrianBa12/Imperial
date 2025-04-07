import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MasterService } from '../Service/master.service';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from "../navbar/navbar.component";
import { FooterComponent } from "../component/footer/footer.component";
@Component({
  selector: 'app-booking',
  imports: [FormsModule, CommonModule, NavbarComponent, FooterComponent],
  templateUrl: './booking.component.html',
  styleUrl: './booking.component.css',
})
export class BookingComponent {
  scheduleId: string = '';
  scheduleData: any;
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

  constructor(
    private activedRoute: ActivatedRoute,
    private masterSrv: MasterService
  ) {
    this.activedRoute.params.subscribe((res: any) => {
      this.scheduleId = res.id;
      this.getScheduleDetailsById();
    });
  }
  // En booking.component.ts
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
        console.log('Respuesta API:', response);

        if (response.success && response.data) {
          const pasajero = this.userSelectedSeatArray[index];
          pasajero.nombreCompleto = response.data.nombre_completo;
        } else {
          alert(response.message || 'No se encontraron datos para este DNI');
        }
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error completo:', err);

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
    this.masterSrv.getScheduleById(this.scheduleId).subscribe((res: any) => {
      this.scheduleData = res.data;
      this.seatMap = res.data.mapaDeAsientos;
    });
  }

  checkSeatStatus(seatNo: number) {
    const seat = this.seatMap.find(s => s.number === seatNo);
    if (!seat) return 'unknown';

    const isSelected = this.userSelectedSeatArray.some(item => item.seatNo === seatNo);
    if (isSelected) return 'selected';

    return seat.estado;
  }

  // En selectSeat method
  selectSeat(seatNo: number) {
    // Verificar si ya se han seleccionado 4 asientos
    if (this.userSelectedSeatArray.length >= 4 &&
      !this.userSelectedSeatArray.some(item => item.seatNo === seatNo)) {
      alert('Solo puedes seleccionar un máximo de 4 asientos');
      return;
    }

    const seat = this.seatMap.find(s => s.number === seatNo);

    if (seat?.estado === 'ocupado') return;

    const existingIndex = this.userSelectedSeatArray.findIndex(item => item.seatNo === seatNo);

    if (existingIndex === -1) {
      const obj = {
        passengerId: 0,
        bookingId: 0,
        seatNo: seatNo,
        tipoDocumento: 'dni',
        numeroDocumento: '',
        nombreCompleto: '',
        edad: null
      };
      this.userSelectedSeatArray.push(obj);
    } else {
      this.userSelectedSeatArray.splice(existingIndex, 1);
    }
  }

  setDocumentType(index: number, type: string) {
    this.userSelectedSeatArray[index].tipoDocumento = type;

    // Si es DNI, limpiamos los otros campos (opcional)
    if (type === 'dni') {
      this.userSelectedSeatArray[index].nombreCompleto = '';
      this.userSelectedSeatArray[index].edad = null;

    }
  }

  // En bookNow method
  // En booking.component.ts
  bookNow() {
    this.formSubmitted = true;
  
    // Validación básica
    if (this.userSelectedSeatArray.length === 0) {
      alert('Por favor seleccione al menos un asiento');
      return;
    }
  
    // Validar datos de pasajeros
    const datosIncompletos = this.userSelectedSeatArray.some(item => {
      if (!item.numeroDocumento) return true;
      if (item.tipoDocumento === 'pasaporte' && (!item.nombreCompleto || !item.edad)) {
        return true;
      }
      return false;
    });
  
    if (datosIncompletos) {
      alert('Por favor complete todos los campos requeridos');
      return;
    }
  
    // Mostrar resumen en lugar de procesar directamente
    this.mostrarResumen = true;
    this.mostrarFormaPago = false;
  }
  
  // Agrega este nuevo método para confirmar el pago
  async confirmarPago() {
    this.procesandoPago = true;
    
    try {
      // Validar datos de tarjeta (simulación)
      if (!this.datosTarjeta.numero || !this.datosTarjeta.nombre || 
          !this.datosTarjeta.expiracion || !this.datosTarjeta.cvv) {
        alert('Por favor complete todos los datos de la tarjeta');
        return;
      }
  
      // Obtener datos del usuario logueado
      const loggedUserDat = localStorage.getItem('redBusUser');
      if (!loggedUserDat) {
        alert('Por favor inicie sesión para realizar una reserva');
        return;
      }
  
      const loggData = JSON.parse(loggedUserDat);
      const userId = loggData.userId;
  
      // 1. Crear reservas para cada asiento
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
  
      await Promise.all(reservasPromesas);
  
      // 2. Actualizar el mapa de asientos
      const nuevoMapaAsientos = this.seatMap.map(asiento => {
        const estaReservado = this.userSelectedSeatArray.some(
          item => item.seatNo === asiento.number
        );
        return {
          number: asiento.number,
          estado: estaReservado ? 'ocupado' : asiento.estado
        };
      });
  
      await this.masterSrv.actualizarMapaAsientos(
        this.scheduleId,
        nuevoMapaAsientos
      ).toPromise();
  
      // 3. Cerrar modal y limpiar
      this.mostrarResumen = false;
      this.mostrarFormaPago = false;
      this.procesandoPago = false;
      
      alert('¡Pago y reserva completados con éxito!');
      this.getScheduleDetailsById();
      this.userSelectedSeatArray = [];
      this.formSubmitted = false;
  
    } catch (error) {
      console.error('Error en la reserva:', error);
      alert('Error al procesar el pago. Por favor intente nuevamente.');
      this.procesandoPago = false;
    }
  }
  isSeatSelected(seatNo: number): boolean {
    return this.userSelectedSeatArray.some(item => item.seatNo === seatNo);
  }
}
