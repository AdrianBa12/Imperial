import { Component } from '@angular/core';
import { NavbarComponent } from "../component/navbar/navbar.component";
import { SearchComponent } from "../component/search/search.component";
import { FooterComponent } from "../component/footer/footer.component";
import { CarruselComponent } from "../component/carrusel/carrusel.component";

@Component({
  selector: 'app-landing',
  imports: [NavbarComponent, SearchComponent, FooterComponent, CarruselComponent],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent {

}
