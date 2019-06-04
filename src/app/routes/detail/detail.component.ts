import {filter, map, share, switchMap, tap} from 'rxjs/operators';
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

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
})
export class DetailComponent implements OnInit, OnDestroy {

  active = true;
  houses: Observable<Array<IHouse>>;
  route_key: string;
  unassigned: Observable<Array<IHouse>>;
  zoom = 16;
  iconUrl = `https://mt.google.com/vt/icon?name=icons/spotlight/spotlight-waypoint-b.png&scale=0.9`;
  routeName = 'bob';
  editRoute = false;
  route$: Observable<IRoute>;
  deliveriesSource: DeliveriesSource;

  displayedColumns = ['handle', 'name', 'remove'];

  routeNameChange = _debounce(evt => this.routeSvc.update(this.route_key, {name: evt}), 500);

  constructor(private route: ActivatedRoute, private houseSvc: HouseService, private deliveriesSvc: DeliveriesService,
              private routeSvc: RouteService, private router: Router) {
  }

  ngOnInit() {
    this.route$ = combineLatest([this.route.paramMap, this.routeSvc.routes$]).pipe(
      map(([params, routes]: [ParamMap, IRoute[]]) => {
        if (params.has('id')) {
          this.route_key = params.get('id') as string;
          const route = routes.find(route => route.id === this.route_key);
          if (route) {
            return route;
          }
        }
        return {} as IRoute;
      }));

    const deliveries$ = this.route$.pipe(
      filter(route => Boolean(route.id)),
      tap(x => console.log(x)),
      switchMap(route => this.deliveriesSvc.getRouteDeliveries(this.routeSvc.getRouteRef(route.id))),
      this.deliveriesSvc.withHouses(this.houseSvc),
      tap(x => console.log(x)),
      share(),
    );
    this.deliveriesSource = new DeliveriesSource(deliveries$);

    this.unassigned = this.houseSvc.unassignedHouses$;

    // this.dragulaSvc.dropModel.subscribe(args => {
    //   let [bag, el, target, source] = args;
    //   this.houseSvc.saveRouteHouses(this.route_key, this.route.houses);
    //   // this.cdr.markForCheck();
    // });
    // this.dragulaSvc.setOptions(this.dragulaBag, {
    //   moves: (el, source, handle, sibling) => handle.tagName === 'mat-ICON',
    // });
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
    this.deliveriesSvc.updateDelivery(item.data.ref, {order: currentIndex});
  }

  getIndexLetter(idx: number): string {
    const start = idx < 26 ? 65 : 71;
    return String.fromCharCode(start + idx);
  }

  remove(key: string) {
    // this.houseSvc.removeHouseFromRoutes(key);
  }

  add(key: string) {
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
