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
import {RouteService} from '@flags/services/route.service';

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

  constructor(private houseSvc: HouseService, private dialog: MatDialog, private deliveriesSvc: DeliveriesService, private routesSvc: RouteService) {
  }

  ngOnInit() {
    this.housesWithRoutes = this.houseSvc.housesWithRoutes$;
    this.housesSource = new HousesSource(this.houseSvc.houses$);
  }

  editHouse(house: IHouse = {} as IHouse) {
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
              const routeRef = this.routesSvc.getRouteRef(res.route);
              if (!house || house.route_ref !== routeRef) {
                this.deliveriesSvc.addDelivery(routeRef, house_ref);
              }
            } else {
              if (house && house.route_ref) {
                this.deliveriesSvc.removeDelivery(house.route_ref, house_ref.id);
              }
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
