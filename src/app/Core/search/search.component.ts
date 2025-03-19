import { Component, inject, OnInit } from '@angular/core';
import { MasterService } from '../Service/master.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'; // Importa el operador map
import { AsyncPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

// Define interfaces para los datos
interface IProvincia {
  id: number;

  nombreProvincia: string;
  code: string;

}

interface IHorarioAutobus {
  id : number
  asientosDisponibles: number
  totalDeAsiento: number
  precio: number
  fechaDeLlegada: string
  fechaDeSalida: string
  scheduleId: number
  nombreDeBus: string
  numeroPLacaBus: string
  terminalSalidaId: string
  terminalLlegadaId: string
 
  
}

@Component({
  selector: 'app-search',
  imports: [AsyncPipe, FormsModule, DatePipe, RouterLink],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css',
})
export class SearchComponent implements OnInit {
  locations$: Observable<IProvincia[]> = new Observable<IProvincia[]>();
  masterSrv = inject(MasterService);
  busList: IHorarioAutobus[] = [];

  searchObj: any = {
    fromLocation: '',
    toLocation: '',
    travelDate: '',
  };

  ngOnInit(): void {
    this.getAllLocations();
  }

  getAllLocations() {
    this.locations$ = this.masterSrv.getProvincias().pipe(
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