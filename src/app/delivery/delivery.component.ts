import {filter, map, shareReplay, switchMap, take} from 'rxjs/operators';
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
import {DocumentReference} from '@angular/fire/firestore';
import {MatCheckboxChange} from '@angular/material';

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
  deliveriesSource: DeliveriesDataSource;
  deliveries$: Observable<Delivery[]>;
  displayedColumns = ['select', 'name'];
  private route$: Observable<IRoute>;
  private allChecked$: Observable<boolean>;
  private someChecked$: Observable<boolean>;

  constructor(private houseSvc: HouseService, private route: ActivatedRoute, private routeSvc: RouteService,
              private deliveriesSvc: DeliveriesService) {
  }

  ngOnInit() {
    this.deliveryForm = new FormGroup({});
    this.route$ = combineLatest([this.route.paramMap, this.routeSvc.routes$]).pipe(
      filter(([routeParams]) => routeParams.has('id')),
      map(([routeParams, routes]) => {
        this.routeID = routeParams.get('id');
        return routes.find(route => route.id === this.routeID) as IRoute;
      }),
    );
    this.deliveries$ = this.route$.pipe(
      // @ts-ignore
      switchMap((route) => {
        // @ts-ignore
        return this.deliveriesSvc.getRouteDeliveries(route!.ref, {withHouses: true});
      }),
      shareReplay({refCount: true, bufferSize: 1}),
    );
    this.deliveriesSource = new DeliveriesDataSource(this.deliveries$);
    this.allChecked$ = this.deliveries$.pipe(
      map(deliveries => deliveries.every(delivery => delivery.delivered)),
    );
    this.someChecked$ = combineLatest([this.allChecked$, this.deliveries$]).pipe(
      map(([all, deliveries]) => !all && deliveries.some(delivery => delivery.delivered)),
    );
  }

  ngOnDestroy() {
    this.active = false;
  }

  masterToggle(event: MatCheckboxChange) {
    this.route$.pipe(take(1)).subscribe(route => route && route.ref && this.deliveriesSvc.toggleAll(route.ref, event.checked));
  }


  toggleDelivery(event: MatCheckboxChange, deliveryRef: DocumentReference) {
    this.deliveriesSvc.updateDelivery(deliveryRef, {delivered: event.checked});
  }

  getIndexLetter(idx: number): string {
    return String.fromCharCode(65 + idx);
  }

  iconUrl(delivery: Delivery): string {
    const color = delivery.delivered ? 'a' : 'b'; // a = green b= red
    return `https://mt.google.com/vt/icon?name=icons/spotlight/spotlight-waypoint-${color}.png&scale=0.9`;
  }

  delivered(delivery_id: string): Promise<boolean> {
    return this.deliveries$.pipe(
      map(deliveries => {
        const theDelivery = deliveries.find(delivery => delivery.id === delivery_id);
        return Boolean(theDelivery && theDelivery.delivered);
      }),
    ).toPromise();
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
