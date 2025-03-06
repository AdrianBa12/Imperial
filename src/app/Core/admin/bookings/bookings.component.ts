import { Component, inject, OnInit, signal } from '@angular/core';
import { MasterService } from '../../Service/master.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-bookings',
  imports: [DatePipe],
  templateUrl: './bookings.component.html',
  styleUrl: './bookings.component.css',
})
export class BookingsComponent implements OnInit {
  loggedData: any;
  masterSrv = inject(MasterService);
  bookingList = signal<any[]>([]);

  constructor() {
    const loggedData = localStorage.getItem('redBusUser');
    if (loggedData) {
      this.loggedData = JSON.parse(loggedData);
    }
  }

  ngOnInit(): void {
    this.getBookings();
  }

  getBookings() {
    this.masterSrv
      .getAllBusBookings(this.loggedData.userId)
      .subscribe((Res: any) => {
        this.bookingList.set(Res);
      });
  }
}
