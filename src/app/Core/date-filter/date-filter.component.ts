import { Component, OnInit } from '@angular/core';
import { BusService } from '../Service/bus.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-date-filter',
  imports: [CommonModule, FormsModule],
  templateUrl: './date-filter.component.html',
  styleUrl: './date-filter.component.css',
})
export class DateFilterComponent implements OnInit {
  origen: string = '';
  destino: string = '';
  fechaIda: string = '';
  fechaRegreso: string = '';
  busesIda: any[] = [];
  busesRegreso: any[] = [];
  selectedBus: any = null;
  seats: any[] = [];

  constructor(private busService: BusService) {}

  ngOnInit(): void {}

  buscarBuses(): void {
    this.busService
      .getBusesByFilter(
        this.origen,
        this.destino,
        this.fechaIda,
        this.fechaRegreso
      )
      .subscribe((response) => {
        this.busesIda = response.BusesIda;
        this.busesRegreso = response.BusesRegreso;
      });
  }

  verAsientos(bus: any): void {
    this.selectedBus = bus;
    this.busService.getSeatsByBus(bus.busId).subscribe((seats) => {
      this.seats = seats;
    });
  }

  reservarAsiento(seatId: number): void {
    this.busService.bookSeat(seatId).subscribe((response) => {
      alert(response);
      this.verAsientos(this.selectedBus);
    });
  }
}
