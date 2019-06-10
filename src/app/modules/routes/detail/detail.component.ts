import {filter, map, shareReplay, switchMap, take, tap} from 'rxjs/operators';
import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';

import {HouseService} from '@flags/services/house.service';
import {IHouse} from '@flags/interfaces/house';
import {combineLatest, Observable} from 'rxjs';
import {RouteService} from '@flags/services/route.service';
import _debounce from 'lodash-es/debounce';
import {IRoute} from '@flags/interfaces/route';
import {DataSource} from '@angular/cdk/table';
import {Delivery} from '@flags/interfaces/delivery';
import {DeliveriesService} from '@flags/services/deliveries.service';
import {CdkDragDrop} from '@angular/cdk/drag-drop';
import {DocumentReference} from '@angular/fire/firestore';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
})
export class DetailComponent implements OnInit, OnDestroy {

  active = true;
  houses: Observable<Array<IHouse>>;
  route_key: string;
  zoom = 16;
  iconUrl = `https://mt.google.com/vt/icon?name=icons/spotlight/spotlight-waypoint-b.png&scale=0.9`;
  editRoute = false;
  route$: Observable<IRoute>;
  deliveries$: Observable<Delivery[]>;
  deliveriesSource: DeliveriesSource;
  housesWithoutRoutes$: Observable<IHouse[]>;

  displayedColumns = ['handle', 'name', 'remove'];
  unassignedColumns = ['name', 'add'];
  routeName: string;

  routeNameChange = _debounce(evt => this.routeSvc.update(this.route_key, {name: evt}), 500);

  constructor(private route: ActivatedRoute, private houseSvc: HouseService, private deliveriesSvc: DeliveriesService,
              private routeSvc: RouteService, private router: Router) {
    this.housesWithoutRoutes$ = this.houseSvc.unassignedHouses$;
  }

  ngOnInit() {
    this.route$ = combineLatest([this.route.paramMap, this.routeSvc.routes$]).pipe(
      filter(([params]) => params.has('id')),
      map(([params, routes]: [ParamMap, IRoute[]]) => {
        this.route_key = params.get('id') as string;
        const route = routes.find(route => route.id === this.route_key);
        if (!route) {
          throw new Error('Route not found');
        }
        return route;
      }),
      tap(route => this.routeName = route.name),
      shareReplay({bufferSize: 1, refCount: true}),
    );

    this.deliveries$ = this.route$.pipe(
      filter(route => Boolean(route && route.ref)),
      // @ts-ignore TS doesn't believe route.ref has to be defined at this point
      switchMap((route: IRoute) => this.deliveriesSvc.getRouteDeliveries(route.ref, {withHouses: true})),
      shareReplay({bufferSize: 1, refCount: true}),
    );
    this.deliveriesSource = new DeliveriesSource(this.deliveries$);
  }

  ngOnDestroy() {
    this.active = false;
  }

  drop(event: CdkDragDrop<Delivery>) {
    console.log(event);
    const {previousIndex, currentIndex, item} = event;
    if (previousIndex === currentIndex) {
      return;
    }
    this.route$.pipe(take(1))
      .subscribe(route => this.deliveriesSvc.reorderDeliveries(
        // @ts-ignore
        route.ref,
        previousIndex, currentIndex));
  }

  getIndexLetter(idx: number): string {
    const start = idx < 26 ? 65 : 71;
    return String.fromCharCode(start + idx);
  }

  remove(id: string) {
    this.route$.pipe(
      take(1),
    ).subscribe(route => this.deliveriesSvc.removeDelivery(
      // @ts-ignore Doesn't know route ref exists
      route.ref,
      id),
    );

  }

  add(houseRef: DocumentReference) {
    this.route$.pipe(
      take(1),
      //@ts-ignore
    ).subscribe(route => this.deliveriesSvc.addDelivery(route!.ref, houseRef));

    // this.houseSvc.addHouseToRoute(this.route_key, key);
  }

  deleteRoute() {
    this.routeSvc.remove(this.route_key)
      .then(() => this.router.navigate(['/routes']));
  }

}

class DeliveriesSource extends DataSource<Delivery> {
  constructor(private deliveries$: Observable<Delivery[]>) {
    super();
    this.deliveries$ = deliveries$;
  }

  connect(): Observable<Delivery[] | ReadonlyArray<Delivery>> {
    return this.deliveries$;
  }

  disconnect(): void {
  }

}
