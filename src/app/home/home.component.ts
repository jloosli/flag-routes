import {Component, OnDestroy, OnInit, QueryList, ViewChildren} from '@angular/core';
import {HouseService} from '../services/house.service';
import {IRoute} from '../interfaces/route';
import {Observable} from 'rxjs/Observable';
import {IHouse} from '../interfaces/house';
import {SebmGoogleMap} from 'angular2-google-maps/core';
import 'rxjs/add/operator/takeWhile';
import {Router} from '@angular/router';

// import 'rxjs/observable/';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {

  routes: Observable<Array<IRoute>>;
  houses: Observable<Array<IHouse>>;
  housesByKey: { [key: string]: IHouse }={};
  zoom: number = 15;
  active: boolean = true;

  @ViewChildren(SebmGoogleMap) maps: QueryList<SebmGoogleMap>;

  constructor(private houseSvc: HouseService, private router: Router) {
  }

  ngOnInit() {
    this.routes = this.houseSvc.routes$.map(routes => {
      return routes.sort((a, b) => a.name < b.name ? -1 : 1);
    });
    this.houses = this.houseSvc.houses$;
    this.houses
      .takeWhile(() => this.active)
      .subscribe((houses) => {
        const houseObj = {};
        houses.forEach(house => {
          houseObj[house.$key] = house;
        });
        this.housesByKey = houseObj;
      });
  }

  ngOnDestroy() {
    this.active = false;
  }

  deliveryStats(route: IRoute): string {
    let delivered = 0;
    if (route.deliveries) {
      for (let key in route.deliveries) {
        if (route.deliveries[key] === true) {
          delivered++;
        }
      }
    }
    const total = route.houses.length;
    return `${delivered} of ${total} Flags Delivered`;
  }

  iconUrl(route: IRoute, house: string): string {
    const color = this.delivered(route, house) ? 'a' : 'b'; // a = green b= red
    return `https://mt.google.com/vt/icon?name=icons/spotlight/spotlight-waypoint-${color}.png&scale=0.9`;
  }

  private delivered(route: IRoute, houseKey: string): boolean {
    return route.deliveries && route.deliveries[houseKey];
  }

  goToDelivery(key) {
    this.router.navigate(['/deliveries', key]);
  }

}
