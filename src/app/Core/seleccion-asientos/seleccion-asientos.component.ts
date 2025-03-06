import { Component, Input, OnInit } from '@angular/core';
import { BusesService } from '../Service/buses.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-seleccion-asientos',
  imports: [CommonModule],
  templateUrl: './seleccion-asientos.component.html',
  styleUrl: './seleccion-asientos.component.css',
})
export class SeleccionAsientosComponent implements OnInit {
  @Input() busId!: number;
  seats: any[] = [];
  selectedSeats: number[] = [];

  constructor(private busesService: BusesService) {}

  ngOnInit() {
    if (this.busId) {
      this.busesService.getSeats(this.busId).subscribe((data) => {
        this.seats = data;
      });
    }
  }

  toggleSeat(seatId: number) {
    if (this.selectedSeats.includes(seatId)) {
      this.selectedSeats = this.selectedSeats.filter((id) => id !== seatId);
    } else {
      this.selectedSeats.push(seatId);
    }
  }
}
