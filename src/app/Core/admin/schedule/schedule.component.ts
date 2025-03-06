import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MasterService } from '../../Service/master.service';
import { Observable } from 'rxjs';
import { AsyncPipe, DatePipe } from '@angular/common';

@Component({
  selector: 'app-schedule',
  imports: [FormsModule, AsyncPipe, DatePipe],
  templateUrl: './schedule.component.html',
  styleUrl: './schedule.component.css',
})
export class ScheduleComponent implements OnInit {
  isFormView: boolean = true;

  scheduleObj: any = {
    scheduleId: 0,
    vendorId: 0,
    busName: '',
    busVehicleNo: '',
    fromLocation: 0,
    toLocation: 0,
    departureTime: '',
    arrivalTime: '',
    scheduleDate: '',
    price: 0,
    totalSeats: 0,
  };

  loggedData: any;
  masterSrv = inject(MasterService);
  locationList: any[] = [];
  scheduleList$: Observable<any[]> = new Observable<any[]>();

  constructor() {
    const loggedData = localStorage.getItem('redBusUser');
    if (loggedData) {
      this.loggedData = JSON.parse(loggedData);
      this.scheduleObj.vendorId = this.loggedData.userId;
      this.scheduleList$ = this.masterSrv.GetBusSchedules(
        this.loggedData.userId
      );
    }
  }

  ngOnInit(): void {
    this.loadLocations();
  }

  loadLocations() {
    this.masterSrv.getLocations().subscribe((res: any) => {
      this.locationList = res;
    });
  }

  onSave() {
    this.masterSrv.createSchedule(this.scheduleObj).subscribe((res: any) => {
      alert('Schedule Created');
    });
  }
}
