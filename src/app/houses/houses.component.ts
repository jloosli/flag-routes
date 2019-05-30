import {Component, OnInit} from '@angular/core';
import {HouseService} from '@flags/services/house.service';
import {Observable} from 'rxjs';
import {IRoute} from '@flags/interfaces/route';
import {EditHouseComponent} from './edit-house/edit-house.component';
import {MatDialog} from '@angular/material';
import {filter} from 'rxjs/operators';
import {DeliveriesService} from '@flags/services/deliveries.service';
import {IHouse} from '@flags/interfaces/house';
import {DataSource} from '@angular/cdk/table';

@Component({
  selector: 'app-houses',
  templateUrl: './houses.component.html',
  styleUrls: ['./houses.component.scss'],
})
export class HousesComponent implements OnInit {

  housesWithRoutes: Observable<Array<any>>;
  routes: Observable<Array<IRoute>>;
  displayedColumns = ['name', 'street', 'notes', 'route'];
  housesSource: HousesSource;

  constructor(private houseSvc: HouseService, private dialog: MatDialog, private deliveriesSvc: DeliveriesService) {
  }

  ngOnInit() {
    this.housesWithRoutes = this.houseSvc.housesWithRoutes$;
    this.housesSource = new HousesSource(this.housesWithRoutes);
  }

  editHouse(house = {}) {
    this.dialog.open(EditHouseComponent, {data: house})
      .afterClosed()
      .pipe(
        filter(Boolean),
      )
      .subscribe(res => {
        if (res.remove) {
          this.houseSvc.removeHouse(res.remove);
        } else {
          this.houseSvc.saveHouse(res).then(house_ref => {
            if (res.route) {
              this.deliveriesSvc.addDelivery(res.route, house_ref);
            }
          });
        }
      });
  }

}

export class HousesSource extends DataSource<IHouse> {
  constructor(private houses$: Observable<IHouse[]>) {
    super();
    this.houses$ = houses$;
  }

  connect(): Observable<IHouse[] | ReadonlyArray<IHouse>> {
    return this.houses$;
  }

  disconnect(): void {
  }

}
