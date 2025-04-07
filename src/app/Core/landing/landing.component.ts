import { Component } from '@angular/core';
import { NavbarComponent } from "../component/navbar/navbar.component";
import { SearchComponent } from "../component/search/search.component";
import { FooterComponent } from "../component/footer/footer.component";

@Component({
  selector: 'app-landing',
  imports: [NavbarComponent, SearchComponent, FooterComponent],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent {

}
