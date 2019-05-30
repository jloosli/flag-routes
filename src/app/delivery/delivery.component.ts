import {map, share, switchMap} from 'rxjs/operators';
import {Component, OnDestroy, OnInit} from '@angular/core';
import {HouseService} from '@flags/services/house.service';
import {ActivatedRoute} from '@angular/router';
import {IHouse} from '@flags/interfaces/house';
import {FormGroup} from '@angular/forms';
import {combineLatest, Observable} from 'rxjs';
import {RouteService} from '@flags/services/route.service';
import {DataSource} from '@angular/cdk/table';
import {Delivery} from '@flags/interfaces/delivery';
import {CollectionViewer} from '@angular/cdk/collections';
import {DeliveriesService} from '@flags/services/deliveries.service';
import {IRoute} from '@flags/interfaces/route';
import {DriversService} from '@flags/services/drivers.service';
import {IDriver} from '@flags/interfaces/driver';

@Component({
  selector: 'app-delivery',
  templateUrl: './delivery.component.html',
  styleUrls: ['./delivery.component.scss'],
})
export class DeliveryComponent implements OnInit, OnDestroy {

  active = true;
  houses: Array<IHouse> = [];
  deliveryForm: FormGroup;
  routeID: string | null;
  zoom = 16;
  driver_icon_colors = ['purple', 'blue', 'yellow', 'green', 'red', 'orange'];
  routeSource: DeliveriesDataSource;
  currentRoute: IRoute | undefined;
  deliveries$: Observable<Delivery[]>;
  drivers$: Observable<IDriver[]>;

  constructor(private houseSvc: HouseService, private route: ActivatedRoute, private routeSvc: RouteService,
              private deliveriesSvc: DeliveriesService, private driversService: DriversService) {
  }

  ngOnInit() {
    this.drivers$ = this.driversService.drivers$;
    this.deliveryForm = new FormGroup({});
    this.deliveries$ = combineLatest([this.route.paramMap, this.routeSvc.routes$]).pipe(
      switchMap(([routeParams, routes]) => {
        this.routeID = routeParams.get('id');
        if (this.routeID) {
          this.currentRoute = routes.find(route => route.id === this.routeID);
        }
        return this.deliveriesSvc.getRouteDeliveries(this.routeSvc.getRouteRef(this.routeID as string));
      }),
      share(),
    );
    this.routeSource = new DeliveriesDataSource(this.deliveries$);

  }

  ngOnDestroy() {
    this.active = false;
  }

  getIndexLetter(idx: number): string {
    return String.fromCharCode(65 + idx);
  }

  async iconUrl(delivery_id: string): Promise<string> {
    const color = await this.delivered(delivery_id) ? 'a' : 'b'; // a = green b= red
    return `https://mt.google.com/vt/icon?name=icons/spotlight/spotlight-waypoint-${color}.png&scale=0.9`;
  }

  driverIconUrl(idx: number): string {
    const color_idx = idx % this.driver_icon_colors.length;
    return `https://maps.google.com/intl/en_us/mapfiles/ms/micons/${this.driver_icon_colors[color_idx]}.png`;
  }

  delivered(delivery_id: string): Promise<boolean> {
    return this.deliveries$.pipe(
      map(deliveries => {
        const theDelivery = deliveries.find(delivery => delivery.id === delivery_id);
        return Boolean(theDelivery && theDelivery.delivered);
      }),
    ).toPromise();
  }

  firstInitial(name: string): string {
    return name.split('')[0] || '';
  }

  toggleChecks(state: boolean) {
    for (const key in this.deliveryForm.controls) {
      this.deliveryForm.controls[key].setValue(state);
    }
  }

}

export class DeliveriesDataSource extends DataSource<Delivery> {
  constructor(private readonly deliveries: Observable<Delivery[]>) {
    super();
    this.deliveries = deliveries;
  }

  connect(collectionViewer: CollectionViewer): Observable<Delivery[] | ReadonlyArray<Delivery>> {
    return this.deliveries;
  }

  disconnect(collectionViewer: CollectionViewer): void {
  }

}
