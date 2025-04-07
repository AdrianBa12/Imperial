import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NgbCarousel, NgbCarouselConfig } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-carrusel',
  imports: [NgbCarousel,CommonModule],
  templateUrl: './carrusel.component.html',
  styleUrl: './carrusel.component.css'
})
export class CarruselComponent {
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
}
