import {Injectable} from '@angular/core';
import {AngularFireDatabase, FirebaseListObservable} from 'angularfire2/database';
import {IHouse} from '../interfaces/house';
import {IRoute} from '../interfaces/route';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/combineLatest';

@Injectable()
export class HouseService {

  houses$: FirebaseListObservable<Array<IHouse>>;
  routes$: FirebaseListObservable<Array<IRoute>>;

  constructor(private db: AngularFireDatabase) {
    this.houses$ = db.list('/houses');
    this.routes$ = db.list('/routes');
  }

  housesByRoute(route_key: string): Observable<Array<IHouse>> {
    return this.db.object(`routes/${route_key}`)
      .combineLatest(this.houses$)
      .map((res) => {
        const [route, houses] = res;
        const housesInRoute = [];
        houses.forEach(house => {
          if (route.houses.indexOf(house.$key) > -1) {
            housesInRoute.push(house);
          }
        });
        return housesInRoute;
      });
  }

  updateDeliveries(route_key, deliveries) {
    return this.db.object(`routes/${route_key}/deliveries`).set(deliveries);
  }

}
