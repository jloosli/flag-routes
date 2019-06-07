import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {RouteDeliveriesComponent} from './route-deliveries.component';

describe('RouteDeliveriesComponent', () => {
  let component: RouteDeliveriesComponent;
  let fixture: ComponentFixture<RouteDeliveriesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RouteDeliveriesComponent],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RouteDeliveriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
