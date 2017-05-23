import {Injectable} from '@angular/core';
import {AngularFireDatabase, FirebaseListObservable} from 'angularfire2/database';
import {IHouse} from '../interfaces/house';
import {IRoute} from '../interfaces/route';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/combineLatest';
import * as _ from 'lodash';

@Injectable()
export class HouseService {

  houses$: FirebaseListObservable<Array<IHouse>>;
  routes$: FirebaseListObservable<Array<IRoute>>;
  housesWithRoutes: Observable<Array<IHouse>>;

  constructor(private db: AngularFireDatabase) {
    this.houses$ = db.list('/houses');
    this.routes$ = db.list('/routes');
    this.housesWithRoutes = this.houses$.combineLatest(this.routes$)
      .map(res => {
        let [houses, routes] = res;
        const combined: Array<IHouse> = [];
        houses.forEach(house => {
          for (let i = routes.length - 1; i--;) {
            if (routes[i].houses.indexOf(house.$key) > -1) {
              house.route = routes[i];
              break;
            }
          }
          combined.push(house);
        });
        return combined;
      });
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

  updateDelivery(route_key: string, house_key: string, status: boolean) {
    return this.db.object(`routes/${route_key}/deliveries/${house_key}`).set(status);
  }

  saveHouse(house) {
    const toSave: IHouse = {
      name: _.get(house, ['name'], ''),
      street: _.get(house, ['street'], ''),
      notes: _.get(house, ['notes'], ''),
    };
    if (house.$key) {
      return this.db.object(`houses/${house.$key}/`).update(toSave)
        .then(() => house.$key);
    } else {
      return this.db.list('houses').push(toSave).then(res => res.key);
    }
  }

  removeHouse(key) {
    this.db.object(`houses/${key}`).remove();
    this.removeHouseFromRoutes(key);
  }

  addHouseToRoute(route_key, house_key) {
    this.removeHouseFromRoutes(house_key); // Make sure it's not attached to any routes
    const list = this.db.list(`routes/${route_key}/houses`);
    return list.first().subscribe(houses => {
      if (!_.find(houses, (house)=> house.$value === house_key)) {
        const house_list = houses.map(house=>house.$value);
        house_list.push(house_key);
        this.db.object(`routes/${route_key}/houses`).set(house_list);
      }
    });
  }

  removeHouseFromRoutes(house_key) {
    this.routes$.first().subscribe(routes => {
      routes.forEach(route => {
        const houseIndex = route.houses.indexOf(house_key);
        if (houseIndex > -1) {
          this.db.object(`routes/${route.$key}/houses/${houseIndex}`).remove();
        }
        this.db.object(`routes/${route.$key}/deliveries/${house_key}`).remove();
      });
    });
  }

}
