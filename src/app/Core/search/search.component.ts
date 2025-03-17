import { Component, inject, OnInit } from '@angular/core';
import { MasterService } from '../Service/master.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'; // Importa el operador map
import { AsyncPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

// Define interfaces para los datos
interface Location {
  id: number;

  locationName: string;
  code: string;

}

interface Bus {
  id : number
  availableSeats: number
  totalSeats: number
  price: number
  arrivalTime: string
  scheduleId: number
  departureTime: string
  busName: string
  busVehicleNo: string
  fromLocationName: string
  toLocationName: string
  vendorName: string
  scheduleDate: string
  vendorId: number
  
}

@Component({
  selector: 'app-search',
  imports: [AsyncPipe, FormsModule, DatePipe, RouterLink],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css',
})
export class SearchComponent implements OnInit {
  locations$: Observable<Location[]> = new Observable<Location[]>();
  masterSrv = inject(MasterService);
  busList: Bus[] = [];

  searchObj: any = {
    fromLocation: '',
    toLocation: '',
    travelDate: '',
  };

  ngOnInit(): void {
    this.getAllLocations();
  }

  getAllLocations() {
    this.locations$ = this.masterSrv.getLocations().pipe(
      map((response: any) => response.data) // Extrae el array de locations de la respuesta
    );
  }

  onSearch() {
    const { fromLocation, toLocation, travelDate } = this.searchObj;
    this.masterSrv
      .searchBus(fromLocation, toLocation, travelDate)
      .subscribe({
        next: (res: any) => {
          this.busList = res.data; // Ajusta según la estructura de la respuesta de Strapi
        },
        error: (err) => {
          console.error('Error al buscar buses:', err);
        },
      });
  }
}