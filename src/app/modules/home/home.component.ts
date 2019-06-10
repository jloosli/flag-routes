import {Component, OnInit, QueryList, ViewChildren} from '@angular/core';
import {HouseService} from '@flags/services/house.service';
import {IRoute} from '@flags/interfaces/route';
import {Observable, Subscription} from 'rxjs';

import {Router} from '@angular/router';
import {RouteService} from '@flags/services/route.service';
import {AgmMap} from '@agm/core';
import {DeliveriesService} from '@flags/services/deliveries.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {

  routesWithHouses$: Observable<Array<IRoute>>;
  zoom = 15;
  private stats = new Map<string, number>();
  private statsSub: Subscription;

  @ViewChildren(AgmMap) maps: QueryList<AgmMap>;

  constructor(private houseSvc: HouseService, private router: Router, private routesSvc: RouteService,
              private deliveriesSvc: DeliveriesService) {
  }

  ngOnInit() {
    this.routesWithHouses$ = this.routesSvc.routesWithHouses$;
  }

  deliveryStats(route: IRoute): string {

    let total = route.house_count || 0;
    const delivered = route.delivered_count;
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
