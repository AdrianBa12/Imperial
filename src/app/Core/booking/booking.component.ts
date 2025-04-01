import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MasterService } from '../Service/master.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-booking',
  imports: [FormsModule],
  templateUrl: './booking.component.html',
  styleUrl: './booking.component.css',
})
export class BookingComponent {
  scheduleId: string = '';
  scheduleData: any;

  seatMap: any[] = []; // Ahora usaremos el mapa de asientos completo
  userSelectedSeatArray: any[] = [];

  constructor(
    private activedRoute: ActivatedRoute,
    private masterSrv: MasterService
  ) {
    this.activedRoute.params.subscribe((res: any) => {
      this.scheduleId = res.id;
      this.getScheduleDetailsById();
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
    
    // Primero verificar si está seleccionado por el usuario
    const isSelected = this.userSelectedSeatArray.some(item => item.seatNo === seatNo);
    if (isSelected) return 'selected';
    
    // Luego verificar el estado original del asiento
    return seat.estado; // 'disponible', 'ocupado', 'reservado'
  }
  selectSeat(seatNo: number) {
    const seat = this.seatMap.find(s => s.number === seatNo);
    
    // No permitir seleccionar asientos ocupados
    if (seat?.estado === 'ocupado') return;
    
    const existingIndex = this.userSelectedSeatArray.findIndex(item => item.seatNo === seatNo);
    
    if (existingIndex === -1) {
      // Si no existe, agregar nuevo asiento
      const obj = {
        passengerId: 0,
        bookingId: 0,
        passengerName: '',
        age: 0,
        gender: '',
        seatNo: seatNo,
      };
      this.userSelectedSeatArray.push(obj);
    } else {
      // Si ya existe, eliminarlo (deseleccionar)
      this.userSelectedSeatArray.splice(existingIndex, 1);
    }
  }

  bookNow() {
    const loggedUserDat = localStorage.getItem('redBusUser');
    if (loggedUserDat) {
      const loggData = JSON.parse(loggedUserDat);
      const obj = {
        bookingId: 0,
        custId: loggData.userId,
        bookingDate: new Date(),
        scheduleId: this.scheduleId,
        BusBookingPassengers: this.userSelectedSeatArray,
      };
      this.masterSrv.onBooking(obj).subscribe(
        (Res: any) => {
          alert('Booking Success');
          // Actualizar el estado de los asientos después de la reserva
          this.getScheduleDetailsById();
          this.userSelectedSeatArray = [];
        },
        (error) => {
          alert('Booking failed');
        }
      );
    } else {
      alert('Please Login');
    }
  }
}