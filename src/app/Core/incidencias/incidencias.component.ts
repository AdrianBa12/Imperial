import { Component } from '@angular/core';
import { NavbarComponent } from "../component/navbar/navbar.component";
import { FooterComponent } from "../component/footer/footer.component";
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-incidencias',
  imports: [NavbarComponent, FooterComponent,FormsModule],
  templateUrl: './incidencias.component.html',
  styleUrl: './incidencias.component.css'
})
export class IncidenciasComponent {

  // Objeto para almacenar los datos del formulario
  incidenciaObj: any = {
    titulo: '',
    descripcion: '',
    fechaDelIncidente: new Date().toISOString().slice(0, 16), // Formato YYYY-MM-DDTHH:MM
    correo: '',
  };

  constructor(private http: HttpClient) { }

  // Método para enviar la incidencia al backend (Strapi)
  onSubmitIncidencia() {
    const payload = {
      data: {
        titulo: this.incidenciaObj.titulo,
        descripcion: this.incidenciaObj.descripcion,
        fechaDelIncidente: new Date(this.incidenciaObj.fechaDelIncidente).toISOString(),
        correo: this.incidenciaObj.correo,
        Prioridad: 'Media', // Valor por defecto (opcional)
        Estado: 'Reportada',  // Valor por defecto
        origen : 'pagina web', 
      }
    };

    this.http.post('https://automatic-festival-37ec7cc8d8.strapiapp.com/api/incidencias-en-rutas', payload)
      .subscribe({
        next: (res) => {
          alert('Incidencia reportada con éxito');
          // Resetear el formulario
          this.incidenciaObj = {
            titulo: '', 
            descripcion: '',
            fechaDelIncidente: new Date().toISOString().slice(0, 16),
            correo:''
          };
        },
        error: (err) => {
          console.error('Error al reportar la incidencia:', err);
          alert('Ocurrió un error. Intenta nuevamente.');
        }
      });
  }

}
