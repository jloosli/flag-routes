import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import 'rxjs/add/operator/takeWhile';
import * as _ from 'lodash';
import {HouseService} from '../../services/house.service';
import {IHouse} from '../../interfaces/house';
import {Observable} from 'rxjs/Observable';
import {IRoute} from '../../interfaces/route';
import {DragulaService} from 'ng2-dragula';
import {RouteService} from '../../services/route.service';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit, OnDestroy {

  dragulaBag: string = 'current_houses';
  active = true;
  houses: Observable<Array<IHouse>> = Observable.of(null);
  route_key: string;
  route: IRoute = {} as IRoute;
  unassigned: Observable<Array<IHouse>>;
  zoom = 16;
  iconUrl = `https://mt.google.com/vt/icon?name=icons/spotlight/spotlight-waypoint-b.png&scale=0.9`;

  editRoute:boolean = false;

  constructor(private aRoute: ActivatedRoute, private houseSvc: HouseService, private dragulaSvc: DragulaService,
              private routeSvc: RouteService, private router: Router) {
  }

  ngOnInit() {
    this.aRoute.params
      .takeWhile(() => this.active)
      .switchMap(params => {
        if (params['id']) {
          this.route_key = params['id'];
          this.houses = this.houseSvc.housesByRoute(params['id']);
          return this.houseSvc.getRoute(params['id']);
        } else {
          return Observable.of(null);
        }
      })
      .subscribe(route => {
        this.route = route;

      });

    this.unassigned = this.houseSvc.unassignedHouses$;

    this.dragulaSvc.dropModel.subscribe(args => {
      let [bag, el, target, source] = args;
      this.houseSvc.saveRouteHouses(this.route_key, this.route.houses);
      // this.cdr.markForCheck();
    });
    this.dragulaSvc.setOptions(this.dragulaBag, {
      moves: (el, source, handle, sibling) => handle.tagName === 'MD-ICON'
    });
  }

  ngOnDestroy() {
    this.active = false;
    this.dragulaSvc.destroy(this.dragulaBag);
  }

  getIndexLetter(idx: number): string {
    const start = idx < 26 ? 65 : 71;
    return String.fromCharCode(start + idx);
  }

  remove(key) {
    this.houseSvc.removeHouseFromRoutes(key);
  }

  add(key) {
    this.houseSvc.addHouseToRoute(this.route_key, key);
  }

  routeNameChange = _.debounce(evt => this.routeSvc.update(this.route_key, {name: evt}), 500);

  deleteRoute() {
    this.routeSvc.remove(this.route_key)
      .then(_=>this.router.navigate(['/routes']));
  }

}
