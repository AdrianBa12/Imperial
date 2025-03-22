import { Component, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AsyncPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MasterService } from '../Service/master.service';

// Define interfaces para los datos
interface IProvincia {
  id: number;
  nombreProvincia: string;
  code: string;
}

interface IHorarioAutobus {
  id: number;
  asientosDisponibles: number;
  totalDeAsiento: number;
  precio: number;
  fechaDeLlegada: string;
  fechaDeSalida: string;
  nombreDeBus: string;
  numeroPLacaBus: string;
  terminalSalidaId: any;
  terminalLlegadaId: any;
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
  isLoading: boolean = false; // Para mostrar un spinner de carga

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

    // Validar que se hayan seleccionado valores
    if (!fromLocation || !toLocation || !travelDate) {
      alert('Por favor, complete todos los campos.');
      return;
    }

    this.isLoading = true; // Mostrar spinner de carga
    this.busList = []; // Limpiar la lista de buses

    this.masterSrv
      .searchBus(fromLocation, toLocation, travelDate)
      .subscribe({
        next: (res: any) => {
          this.busList = res.data.map((item: any) => ({
            id: item.id,
            asientosDisponibles: item.asientosDisponibles,
            totalDeAsiento: item.totalDeAsiento,
            precio: item.precio,
            fechaDeLlegada: item.fechaDeLlegada,
            fechaDeSalida: item.fechaDeSalida,
            nombreDeBus: item.nombreDeBus,
            numeroPLacaBus: item.numeroPLacaBus,
            terminalSalidaId: item.terminalSalidaId,
            terminalLlegadaId: item.terminalLlegadaId,
          }));
          this.isLoading = false; // Ocultar spinner de carga
        },
        error: (err) => {
          console.error('Error al buscar buses:', err);
          this.isLoading = false; // Ocultar spinner de carga
        },
      });
  }
}