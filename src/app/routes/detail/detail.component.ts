import {map} from 'rxjs/operators';
import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';

import {HouseService} from '@flags/services/house.service';
import {IHouse} from '@flags/interfaces/house';
import {Observable} from 'rxjs';
import {RouteService} from '@flags/services/route.service';
import _debounce from 'lodash-es/debounce';
import {IRoute} from '@flags/interfaces/route';

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

  routeNameChange = _debounce(evt => this.routeSvc.update(this.route_key, {name: evt}), 500);

  constructor(private route: ActivatedRoute, private houseSvc: HouseService,
              private routeSvc: RouteService, private router: Router) {
  }

  ngOnInit() {
    this.route$ = this.route.paramMap.pipe(
      map((params: ParamMap) => {
        if (params.has('id')) {
          this.route_key = params.get('id') as string;
          // this.houses = this.houseSvc.housesByRoute(this.route_key);
          // return this.houseSvc.getRoute(this.route_key);
          // null as unknown as IRoute;
        } else {
          // return of(null as unknown as IRoute);
        }
        return {} as IRoute;
      }));

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
    // this.dragulaSvc.destroy(this.dragulaBag);
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
