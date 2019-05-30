import {Component, OnInit, QueryList, ViewChildren} from '@angular/core';
import {HouseService} from '@flags/services/house.service';
import {IRoute} from '@flags/interfaces/route';
import {Observable} from 'rxjs';
import {IHouse} from '@flags/interfaces/house';

import {Router} from '@angular/router';
import {RouteService} from '@flags/services/route.service';
import {AgmMap} from '@agm/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {

  routesWithHouses$: Observable<Array<IRoute>>;
  housesByKey: { [key: string]: IHouse } = {};
  zoom = 15;

  @ViewChildren(AgmMap) maps: QueryList<AgmMap>;

  constructor(private houseSvc: HouseService, private router: Router, private routesSvc: RouteService) {
  }

  ngOnInit() {
    this.routesWithHouses$ = this.routesSvc.routesWithHouses$;
  }

  deliveryStats(route: IRoute): string {
    let delivered = 0;
    let total= 27;
    // if (route.deliveries) {
    //   for (let key in route.deliveries) {
    //     if (route.deliveries[key] === true) {
    //       delivered++;
    //     }
    //   }
    // }
    // const total = _.get(route, ['houses$'], []).length;
    return `${delivered} of ${total} Flags Delivered`;
  }

  iconUrl(route: IRoute, house: string): string {
    const color = this.delivered(route, house) ? 'a' : 'b'; // a = green b= red
    return `https://mt.google.com/vt/icon?name=icons/spotlight/spotlight-waypoint-${color}.png&scale=0.9`;
  }

  private delivered(route: IRoute, houseKey: string): boolean {
    // return route.deliveries && route.deliveries[houseKey];
    return true;
  }

  goToDelivery(id: string) {
    this.router.navigate(['/deliveries', id]);
  }

}
