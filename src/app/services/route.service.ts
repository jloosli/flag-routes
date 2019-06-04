import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {AngularFirestore, AngularFirestoreCollection, DocumentReference} from '@angular/fire/firestore';
import {IRoute} from '@flags/interfaces/route';
import {DeliveriesService} from '@flags/services/deliveries.service';
import {combineLatest} from 'rxjs/internal/observable/combineLatest';
import {map, shareReplay, switchMap, take} from 'rxjs/operators';
import {zip} from 'rxjs/internal/observable/zip';
import {of} from 'rxjs/internal/observable/of';
import {HouseService} from '@flags/services/house.service';
import {collSnapshotWithIDs} from '../shared/rxPipes';

@Injectable({
  providedIn: 'root',
})
export class RouteService {

  routes$: Observable<IRoute[]>;
  routesWithHouses$: Observable<IRoute[]>;
  private routesCollection: AngularFirestoreCollection<IRoute>;

  constructor(
    private af: AngularFirestore,
    private deliveriesSvc: DeliveriesService,
    private housesSvc: HouseService,
  ) {
    this.routesCollection = af.collection<IRoute>('routes', ref => ref.orderBy('order'));
    this.routes$ = this.routesCollection.snapshotChanges().pipe(
      collSnapshotWithIDs<IRoute>(),
      shareReplay({bufferSize: 1, refCount: true}),
    );
    this.routesWithHouses$ = combineLatest([this.routes$, this.housesSvc.houses$]).pipe(
      switchMap(([routes, houses]) => {
        return zip(
          of(routes),
          zip(...routes.map((route: IRoute) => this.deliveriesSvc.getRouteDeliveries(this.getRouteRef(route.id as string)))),
          of(houses),
        );
      }),
      map(([routes, deliveries, houses]) => {
        return routes.map((route, idx) => {
          const routeDeliveries = deliveries[idx];
          return {...route, houses: routeDeliveries.map(delivery => houses.find(house => house.id === delivery.id))};
        }) as IRoute[];
      }),
    );
  }

  clearRoutes() {
    return this.routesCollection.get().subscribe(routeSnap => routeSnap.forEach(result => result.ref.delete()));
  }

  add(name: string) {

    return this.routes$.pipe(take(1)).toPromise()
      .then(routes => routes.length + 1)
      .then(order => {
        const routeToSave: IRoute = {
          name: name,
          house_count: 0,
          order: order,
        };
        return this.routesCollection.add(routeToSave);
      });
  }

  update(route_id: string, updates: Partial<IRoute>) {
    return this.routesCollection.doc(route_id).set(updates, {merge: true});
  }

  remove(route_ref: string | DocumentReference) {
    const ref = this.getRouteRef(route_ref);
    return Promise.all([ref.delete(), this.deliveriesSvc.removeAllRouteDeliveries(ref)]);
  }

  getRouteRef(route_ref: string | DocumentReference): DocumentReference {
    if (typeof route_ref === 'string') {
      route_ref = this.routesCollection.doc(route_ref).ref;
    }
    return route_ref;
  }


}
