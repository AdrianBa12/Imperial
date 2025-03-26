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

  seatArray: number[] = [];
  bookedSeatsArray: number[] = [];

  userSelectedSeatArray: any[] = [];

  constructor(
    private activedRoute: ActivatedRoute,
    private masterSrv: MasterService
  ) {
    this.activedRoute.params.subscribe((res: any) => {
      this.scheduleId = res.id;
      this.getScheduleDetailsById();
      // this.getBookedSeats();
    });
  }

  getScheduleDetailsById() {
    this.masterSrv.getScheduleById(this.scheduleId).subscribe((res: any) => {
      this.scheduleData = res.data;
      // Reiniciamos el array de asientos para evitar duplicados
      this.seatArray = [];
      for (let index = 1; index <= this.scheduleData.totalDeAsiento; index++) {
        this.seatArray.push(index);
      }
    });
  }

  // getBookedSeats() {
  //   this.masterSrv.getBookedSeats(this.scheduleId).subscribe((res: any) => {
  //     this.bookedSeatsArray = res;
  //   });
  // }

  checkIfSeatBooked(seatNo: number) {
    return this.bookedSeatsArray.indexOf(seatNo);
  }

  selectSeat(seatNo: number) {
    // Primero verificar si el asiento ya está seleccionado
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
      // Si ya existe, puedes:
      // 1. Eliminarlo (para deseleccionar)
      this.userSelectedSeatArray.splice(existingIndex, 1);
      
      // O 2. Mostrar un mensaje (alternativa)
      // alert('Este asiento ya está seleccionado');
    }
  }

  checkIsSeatSelected(seatNo: number) {
    return this.userSelectedSeatArray.findIndex((m) => m.seatNo === seatNo);
  }

  bookNow() {
    const loggedUserDat = localStorage.getItem('redBusUser');
    if (loggedUserDat) {
      const loggData = JSON.parse(loggedUserDat);
      const obj = {
        bookingId: 0,
        custId: loggData.userId,
        bookingDate: new Date(),
        scheduleId: this.scheduleId, // Aquí ya estamos usando documentId
        BusBookingPassengers: this.userSelectedSeatArray,
      };
      this.masterSrv.onBooking(obj).subscribe(
        (Res: any) => {
          alert('Booking Success');
        },
        (error) => {
          alert('Booking failed');
        }
      );
    } else {
      alert('Please Login ');
    }
  }
}
