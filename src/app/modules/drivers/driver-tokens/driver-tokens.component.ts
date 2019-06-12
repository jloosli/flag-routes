import {Component, OnInit} from '@angular/core';
import {IDriver} from '@flags/interfaces/driver';
import {combineLatest, Observable} from 'rxjs';
import {DriversService} from '@flags/services/drivers.service';
import {map} from 'rxjs/operators';

@Component({
  selector: 'app-driver-tokens',
  templateUrl: './driver-tokens.component.html',
  styleUrls: ['./driver-tokens.component.scss'],
})
export class DriverTokensComponent implements OnInit {
  drivers$: Observable<(IDriver & { iconUrl: string | { scale: number, path: string, rotation: number } })[]>;

  constructor(private driversSvc: DriversService) {
  }

  ngOnInit() {
    const googleMaps$: Observable<any> = new Observable(obs => {
      const timeout = () => setTimeout(() => {
        if ('google' in window) {
          obs.next((window as any).google.maps);
        } else {
          timeout();
        }
      }, 100);
      timeout();
    });
    this.drivers$ = combineLatest([this.driversSvc.drivers$, googleMaps$]).pipe(
      map(([drivers, maps]) => drivers.map(driver => {
        return {
          ...driver,
          iconUrl: {
            path: driver.heading ? maps.SymbolPath.FORWARD_CLOSED_ARROW : maps.SymbolPath.CIRCLE,
            rotation: driver.heading || 0,
            scale: 4,
            strokeColor: 'silver',
          },
        };
      })),
    );
  }
}
