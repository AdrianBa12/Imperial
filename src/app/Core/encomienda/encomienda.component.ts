import { Component } from '@angular/core';
import { NavbarComponent } from "../component/navbar/navbar.component";
import { FooterComponent } from "../component/footer/footer.component";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MasterService } from '../Service/master.service';
interface Encomienda {
  id: number;
  documentId: string;
  documentoEmisor: string;
  NombreCompletoEmisor: string;
  celularEmisor: string;
  documentoReceptor: string;
  nombreCompletoReceptor: string;
  celularReceptor: string;
  estadoPago: string;
  pesoKg: number;
  montoCobrar: number;
  estadoDeEntrega: string;
  // ... otros campos que necesites
}

interface ApiResponse {
  data: Encomienda[];
  meta: any;
}
@Component({
  selector: 'app-encomienda',
  imports: [NavbarComponent, FooterComponent, CommonModule, FormsModule],
  templateUrl: './encomienda.component.html',
  styleUrl: './encomienda.component.css'
})

export class EncomiendaComponent {
  dni: string = ''; // Cambiado a string para coincidir con el template
  encomiendas: Encomienda[] = []; // Cambiado el nombre y tipado

  constructor(private masterService: MasterService) { }

  buscarEncomiendas() {
    if (!this.dni) {
      alert('Por favor, ingrese un DNI válido.');
      return;
    }

    this.masterService.getEncomiendasByDni(this.dni).subscribe({
      next: (response: ApiResponse) => {
        this.encomiendas = response.data || [];
      },
      error: (error) => {
        console.error('Error al obtener encomiendas', error);
        this.encomiendas = [];
      }
    });
  }
}