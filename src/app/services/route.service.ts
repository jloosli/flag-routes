import {Injectable} from '@angular/core';
import {combineLatest, Observable, of, zip} from 'rxjs';
import {AngularFirestore, AngularFirestoreCollection, DocumentReference} from '@angular/fire/firestore';
import {IRoute} from '@flags/interfaces/route';
import {DeliveriesService} from '@flags/services/deliveries.service';
import {map, shareReplay, switchMap} from 'rxjs/operators';
import {HouseService} from '@flags/services/house.service';
import {collSnapshotWithIDs} from '@flags/shared/rxPipes';
import {Delivery} from '@flags/interfaces/delivery';

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
          zip(...routes.map((route: IRoute) => this.deliveriesSvc.getRouteDeliveries(this.getRouteRef(route.ref as DocumentReference)))),
          of(houses),
        );
      }),
      map(([routes, deliveries, houses]) => {
        return routes.map((route, idx) => {
          const routeDeliveries = deliveries[idx];
          const delivered_count = deliveries[idx].reduce((prev: number, curr: Delivery) => prev + (curr.delivered ? 1 : 0), 0);
          return {
            ...route,
            houses: routeDeliveries.map(delivery => houses.find(house => house.id === delivery.id)),
            delivered_count,
          };
        }) as IRoute[];
      }),
    );
  }


  async add(name: string, order?: number) {
    if (order === null) {
      const routesSnap = await this.routesCollection.get().toPromise();
      order = routesSnap.size;
    }
    const routeToSave: IRoute = {
      name: name,
      house_count: 0,
      order: order,
    };
    return this.routesCollection.add(routeToSave);
  }

  update(route_id: string, updates: Partial<IRoute>) {
    return this.routesCollection.doc(route_id).set(updates, {merge: true});
  }

  remove(route_ref: string | DocumentReference) {
    const ref = this.getRouteRef(route_ref);
    return Promise.all([ref.delete(), this.deliveriesSvc.removeAllRouteDeliveries(ref)]);
  }

  async clearAllRoutes() {
    const routesSnap = await this.routesCollection.get().toPromise();
    const deletionPromises: Promise<any>[] = [];
    routesSnap.forEach(routeSnap => {
      deletionPromises.push(this.deliveriesSvc.removeAllRouteDeliveries(routeSnap.ref));
      deletionPromises.push(routeSnap.ref.delete());
    });
    return Promise.all(deletionPromises);
  }


  getRouteRef(route_ref: string | DocumentReference): DocumentReference {
    if (typeof route_ref === 'string') {
      route_ref = this.routesCollection.doc(route_ref).ref;
    }
    return route_ref;
  }


}
