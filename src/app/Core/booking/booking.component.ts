import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MasterService } from '../Service/master.service';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
@Component({
  selector: 'app-booking',
  imports: [FormsModule],
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
  bookNow() {
    this.formSubmitted = true;

    // Validación diferente para DNI y Pasaporte
    const isValid = this.userSelectedSeatArray.every(item => {
      if (this.userSelectedSeatArray.length > 4) {
        alert('No puedes reservar más de 4 asientos');
        return;
      }
      // Todos necesitan número de documento
      if (!item.numeroDocumento) return false;

      // Para pasaporte, validamos todos los campos excepto género
      if (item.tipoDocumento === 'pasaporte') {
        return item.nombreCompleto && item.edad; // Eliminado: && item.genero
      }
      
      // Para DNI solo validamos el número de documento
      return true;
    });

    // Resto del método permanece igual
  }
  isSeatSelected(seatNo: number): boolean {
  return this.userSelectedSeatArray.some(item => item.seatNo === seatNo);
}
}
