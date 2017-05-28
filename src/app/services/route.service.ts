import {Injectable} from '@angular/core';
import {IRoute} from '../interfaces/route';
import {Observable} from 'rxjs/Observable';
import {AngularFireDatabase} from 'angularfire2/database';
import * as _ from 'lodash';

@Injectable()
export class RouteService {

  routes$: Observable<Array<IRoute>>;

  constructor(private db: AngularFireDatabase) {
    this.routes$ = this.db.list('routes')
      .map(routes => routes.sort((a, b) => a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1));
  }

  clearRoutes() {
    return this.db.object('routes').set({});
  }

  save(route) {
    const routeToSave: IRoute = {
      name: _.get(route, ['name'], ''),
      houses: _.get(route, ['houses'], []),
      deliveries: {}
    };
    return this.db.list('routes').push(routeToSave)
      .then(res => res.key);
  }

  update(route_key, updates) {
    const changes = _.pick(updates, ['name', 'houses', 'deliveries']);
    return this.db.object(`routes/${route_key}`).update(changes);
  }

  remove(route_key) {
    return this.db.object(`routes/${route_key}`).remove();
  }

}
