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
  housesWithRoutes$: Observable<Array<IHouse>>;
  unassignedHouses$: Observable<Array<IHouse>>;

  constructor(private db: AngularFireDatabase) {
    this.houses$ = db.list('/houses');
    this.routes$ = db.list('/routes');
    this.housesWithRoutes$ = this.routes$.combineLatest(this.houses$)
      .map(res => {
        let [ routes, houses] = res;
        const combined: Array<IHouse> = [];
        houses.forEach(house => {
          for (let i = routes.length; i--;) {
            if (routes[i].houses.indexOf(house.$key) > -1) {
              house.route = routes[i];
              break;
            }
          }
          combined.push(house);
        });
        return combined;
      });

    this.unassignedHouses$ = this.houses$.combineLatest(this.routes$)
      .map(res => {
        let [houses, routes] = res;
        const unassigned: Array<IHouse> = [];
        houses.forEach(house => {
          let assigned = false;
          for (let i = routes.length; i--;) {
            if (_.get(routes, [i, 'houses'], []).indexOf(house.$key) > -1) {
              assigned = true;
              break;
            }
          }
          if (!assigned) {
            unassigned.push(house);
          }
        });
        return unassigned;
      });
  }

  housesByRoute(route_key: string): Observable<Array<IHouse>> {
    return this.db.object(`routes/${route_key}`)
      .combineLatest(this.houses$)
      .map((res) => {
        const [route, houses] = res;
        const housesInRoute = [];
        _.get(route, ['houses'], []).forEach(house_key => {
          const houseInRoute = _.find(houses, (house) => house.$key === house_key);
          if (houseInRoute) {
            housesInRoute.push(houseInRoute);
          }
        });
        return housesInRoute;
      });
  }

  updateDelivery(route_key: string, house_key: string, status: boolean) {
    return this.db.object(`routes/${route_key}/deliveries/${house_key}`).set(status);
  }

  clearHouses() {
    this.db.object('houses').set({});
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
      if (!_.find(houses, (house) => house.$value === house_key)) {
        const house_list = houses.map(house => house.$value);
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

  getRoute(key): Observable<IRoute> {
    return this.db.object(`routes/${key}`);
  }

  saveRouteHouses(route_key, houses) {
    this.db.object(`routes/${route_key}/houses`).set(houses);
  }

}
