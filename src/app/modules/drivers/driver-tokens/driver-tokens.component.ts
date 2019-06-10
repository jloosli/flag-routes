import {Component, OnInit} from '@angular/core';
import {IDriver} from '@flags/interfaces/driver';
import {Observable} from 'rxjs';
import {DriversService} from '@flags/services/drivers.service';

@Component({
  selector: 'app-driver-tokens',
  templateUrl: './driver-tokens.component.html',
  styleUrls: ['./driver-tokens.component.scss'],
})
export class DriverTokensComponent implements OnInit {
  drivers$: Observable<IDriver[]>;

  constructor(private driversSvc: DriversService) {
  }

  ngOnInit() {
    this.drivers$ = this.driversSvc.drivers$;
  }

}
