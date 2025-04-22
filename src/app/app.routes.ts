import { Routes } from '@angular/router';
// import { DateFilterComponent } from './Core/date-filter/date-filter.component';
import { BusquedaBusesComponent } from './Core/busqueda-buses/busqueda-buses.component';
import { SeleccionAsientosComponent } from './Core/seleccion-asientos/seleccion-asientos.component';
import { SearchComponent } from './Core/component/search/search.component';
import { BookingComponent } from './Core/booking/booking.component';
import { ScheduleComponent } from './Core/admin/schedule/schedule.component';
import { BookingsComponent } from './Core/admin/bookings/bookings.component';
import { LandingComponent } from './Core/landing/landing.component';
import { IncidenciasComponent } from './Core/incidencias/incidencias.component';
import { EncomiendaComponent } from './Core/encomienda/encomienda.component';
export const routes: Routes = [
  // { path: '', redirectTo: 'buscar', pathMatch: 'full' },
  // { path: 'buscar', component: BusquedaBusesComponent },
  // { path: 'seleccion-asientos', component: SeleccionAsientosComponent },

  { path: '', component: LandingComponent },  // Ruta base muestra LandingComponent
  { path: 'search', component: LandingComponent },  // Mantener compatibilidad
  { path: 'booking/:id', component: BookingComponent },
  { path: 'schedule', component: ScheduleComponent },
  { path: 'bookings', component: BookingsComponent },
  { path: 'incidencias', component: IncidenciasComponent },
  { path: 'encomienda', component: EncomiendaComponent },
  { path: '**', redirectTo: '' }  // Catch-all para rutas no encontradas
];
