import { Component, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AsyncPipe, CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MasterService } from '../Service/master.service';
import { NgbCarouselConfig, NgbCarouselModule } from '@ng-bootstrap/ng-bootstrap';

// Define interfaces para los datos
interface IProvincia {
  id: number;
  nombreProvincia: string;
  code: string;
}

interface IHorarioAutobus {
  documentId: string;
  id: number;
  asientosDisponibles: number;
  totalDeAsiento: number;
  precio: number;
  fechaDeLlegada: string;
  fechaDeSalida: string;
  claseDeBus: string;
  numeroPLacaBus: string;
  terminalSalidaId: any;
  terminalLlegadaId: any;
  duracionEnHoras:number;
}

@Component({
  selector: 'app-search',
  imports: [AsyncPipe, FormsModule, DatePipe, RouterLink, NgbCarouselModule,CommonModule],
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

  // En tu componente
images = [
  {
    url: 'https://res.cloudinary.com/dd6ferfis/image/upload/v1728709354/slide1_kydgds.jpg',
    title: 'Viaja con Comodidad',
    description: 'Descubre nuestras rutas premium'
  },
  {
    url: 'https://res.cloudinary.com/dd6ferfis/image/upload/v1728784240/slide2_giduxc.jpg',
    title: 'Servicio de Primera',
    description: 'Asientos cómodos y amplios'
  },
  {
    url: 'https://res.cloudinary.com/dd6ferfis/image/upload/v1728786636/slide3_estnf9.jpg',
    title: 'Puntualidad Garantizada',
    description: 'Llegamos a tiempo, siempre'
  }
];
  constructor(config: NgbCarouselConfig) {
		// customize default values of carousels used by this component tree
		config.interval = 2000;
		config.wrap = true;
		config.keyboard = true;
		config.pauseOnHover = false;
	}
  
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
            documentId: item.documentId,
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
            claseDeBus: item.claseDeBus,
            duracionEnHoras:item.duracionEnHoras
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