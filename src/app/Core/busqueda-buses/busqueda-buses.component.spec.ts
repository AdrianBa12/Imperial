import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusquedaBusesComponent } from './busqueda-buses.component';

describe('BusquedaBusesComponent', () => {
  let component: BusquedaBusesComponent;
  let fixture: ComponentFixture<BusquedaBusesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BusquedaBusesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BusquedaBusesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
