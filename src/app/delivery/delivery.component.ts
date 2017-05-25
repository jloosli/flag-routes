import {Component, OnDestroy, OnInit} from '@angular/core';
import {HouseService} from '../services/house.service';
import {ActivatedRoute} from '@angular/router';
import {IRoute} from '../interfaces/route';
import 'rxjs/add/operator/combineLatest';
import 'rxjs/add/operator/takeWhile';
import * as _ from 'lodash';
import {IHouse} from '../interfaces/house';
import {FormControl, FormGroup} from '@angular/forms';
import {DriverService} from '../services/driver.service';
import {IDriver} from '../interfaces/driver';
import {Observable} from 'rxjs/Observable';

@Component({
  selector: 'app-delivery',
  templateUrl: './delivery.component.html',
  styleUrls: ['./delivery.component.scss']
})
export class DeliveryComponent implements OnInit, OnDestroy {

  active: boolean = true;
  currentRoute: IRoute = null;
  houses: Array<IHouse> = [];
  deliveryForm: FormGroup;
  route_key: string;
  zoom = 16;
  broadcast: FormGroup = new FormGroup({
    doBroadcast: new FormControl(false),
    name: new FormControl('')
  });
  hasGeo = false;
  drivers: Observable<Array<IDriver>>;
  driver_icon_colors = ['purple', 'blue', 'yellow', 'green', 'red', 'orange'];

  constructor(private houseSvc: HouseService, private route: ActivatedRoute, private driverSvc: DriverService) {
  }

  ngOnInit() {
    this.deliveryForm = new FormGroup({});
    this.route.params
      .combineLatest(this.houseSvc.routes$)
      .takeWhile(() => this.active)
      .subscribe(res => {
        const [params, routes] = res;
        this.route_key = params.key;
        const the_route = _.find(routes, (route) => route.$key === params.key);
        if (the_route) {
          if (!_.isEqual(the_route, this.currentRoute)) {
            this.currentRoute = the_route;
          }
          this.currentRoute.houses.forEach(house_key => {
            const delivered = !!(this.currentRoute.deliveries && this.currentRoute.deliveries[house_key]);
            if (!(house_key in this.deliveryForm.value)) {
              this.deliveryForm.addControl(house_key, new FormControl(delivered));
            } else {
              if (this.deliveryForm.value[house_key] !== delivered) {
                this.deliveryForm.controls[house_key].setValue(delivered);
              }
            }

          });
          this.houseSvc.housesByRoute(params.key).first().subscribe(houses => {
            this.houses = houses;

          });
        } else {
          this.houses = [];
        }

      });

    this.broadcast.controls['doBroadcast'].valueChanges.takeWhile(() => this.active)
      .subscribe(broadcast => {
        if (broadcast) {
          this.driverSvc.createDriver(this.broadcast.controls['name'].value);
        } else {
          this.driverSvc.removeDriver();
        }
      });

    this.broadcast.controls['name'].valueChanges.takeWhile(() => this.active)
      .debounceTime(500)
      .subscribe(name => this.driverSvc.updateDriver({name: name}));

    window.addEventListener('unload', _ => this.ngOnDestroy());
    this.hasGeo = this.driverSvc.hasGeo;
    this.drivers = this.driverSvc.drivers$;

  }

  ngOnDestroy() {
    this.active = false;
    this.driverSvc.removeDriver();
  }

  getIndexLetter(idx: number): string {
    return String.fromCharCode(65 + idx);
  }

  byKey(idx, val) {
    return val ? val.$key : undefined;
  }

  iconUrl(house: string): string {
    const color = this.delivered(house) ? 'a' : 'b'; // a = green b= red
    return `https://mt.google.com/vt/icon?name=icons/spotlight/spotlight-waypoint-${color}.png&scale=0.9`;
  }

  driverIconUrl(idx: number): string {
    const color_idx = idx % this.driver_icon_colors.length;
    return `http://maps.google.com/intl/en_us/mapfiles/ms/micons/${this.driver_icon_colors[color_idx]}.png`;
  }

  delivered(house: string): boolean {
    return this.currentRoute.deliveries && this.currentRoute.deliveries[house];
  }

  changeDelivery(house_key, status) {
    this.houseSvc.updateDelivery(this.route_key, house_key, status);
  }

  firstInitial(name: string): string {
    return name.split('')[0] || '';
  }

  toggleChecks(state: boolean) {
    for (const key in this.deliveryForm.controls) {
      this.deliveryForm.controls[key].setValue(state);
    }
  }

}
