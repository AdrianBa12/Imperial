import { Component, inject, OnInit } from '@angular/core';
import { MasterService } from '../Service/master.service';

import { Observable } from 'rxjs';
import { AsyncPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-search',
  imports: [AsyncPipe, FormsModule, DatePipe, RouterLink],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css',
})
export class SearchComponent implements OnInit {
  locations$: Observable<any[]> = new Observable<any[]>();
  masterSrv = inject(MasterService);
  busList: any[] = [];

  searchObj: any = {
    fromLocation: '',
    toLocation: '',
    travelDate: '',
  };

  ngOnInit(): void {
    this.getAllLocations();
  }

  getAllLocations() {
    this.locations$ = this.masterSrv.getLocations();
  }

  onSearch() {
    const { fromLocation, toLocation, travelDate } = this.searchObj;
    this.masterSrv
      .searchBus(fromLocation, toLocation, travelDate)
      .subscribe((res: any) => {
        this.busList = res;
      });
  }
}
