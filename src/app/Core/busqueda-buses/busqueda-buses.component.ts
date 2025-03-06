import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BusesService } from '../Service/buses.service';
import { FormsModule } from '@angular/forms'; // <-- Importar aquí
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
@Component({
  selector: 'app-busqueda-buses',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './busqueda-buses.component.html',
  styleUrl: './busqueda-buses.component.css',
})
export class BusquedaBusesComponent {
  origen: string = '';
  destino: string = '';
  fechaIda: string = '';

  busesIda: any[] = [];

  constructor(private busesService: BusesService, private router: Router) {}

  buscarBuses(origen: string, destino: string, fechaIda: string) {
    if (!origen || !destino || !fechaIda) {
      alert('Por favor, completa todos los campos.');
      return;
    }

    this.busesService.getBuses(origen, destino, fechaIda).subscribe({
      next: (data) => {
        console.log('Buses recibidos:', data);
        this.busesIda = data.busesIda || [];
      },
      error: (error) => console.error('Error al obtener buses', error),
    });
  }

  seleccionarBus(busId: number) {
    this.router.navigate(['/asientos', busId]);
  }
}
