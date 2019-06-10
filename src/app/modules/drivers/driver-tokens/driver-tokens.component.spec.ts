import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {DriverTokensComponent} from './driver-tokens.component';

describe('DriverTokensComponent', () => {
  let component: DriverTokensComponent;
  let fixture: ComponentFixture<DriverTokensComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DriverTokensComponent],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DriverTokensComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
