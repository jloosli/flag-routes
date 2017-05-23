import {Component, OnDestroy, OnInit} from '@angular/core';
import {HouseService} from '../services/house.service';
import {ActivatedRoute} from '@angular/router';
import {IRoute} from '../interfaces/route';
import 'rxjs/add/operator/combineLatest';
import 'rxjs/add/operator/takeWhile';
import * as _ from 'lodash';
import {IHouse} from '../interfaces/house';
import {FormControl, FormGroup} from '@angular/forms';

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
  updatingForm: boolean = false;
  route_key: string;
  zoom = 16;

  constructor(private houseSvc: HouseService, private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.deliveryForm = new FormGroup({});
    this.route.params
      .combineLatest(this.houseSvc.routes$)
      .takeWhile(() => this.active)
      .subscribe(res => {
        const [params, routes] = res;
        this.route_key = params.key;
        this.currentRoute = _.find(routes, (route) => route.$key === params.key);
        this.updatingForm = true;
        if (this.currentRoute) {
          this.currentRoute.houses.forEach(house_key => {
            const delivered = !!(this.currentRoute.deliveries && this.currentRoute.deliveries[house_key]);
            this.deliveryForm.addControl(house_key, new FormControl(delivered));
          });
          this.houseSvc.housesByRoute(params.key).first().subscribe(houses => {
            this.houses = houses;

          });
        } else {
          this.houses = [];
        }
        this.updatingForm = false;
      });

    this.deliveryForm
      .valueChanges
      .subscribe(deliveries => {
        !this.updatingForm && this.houseSvc.updateDeliveries(this.route_key, deliveries);
      });
  }

  ngOnDestroy() {
    this.active = false;
  }

  getIndexLetter(idx: number): string {
    return String.fromCharCode(65 + idx);
  }

  byKey(idx, val) {
    return val? val.$key: undefined ;
  }

  iconUrl(house: string): string {
    const color = this.delivered(house) ? 'a' : 'b'; // a = green b= red
    return `https://mt.google.com/vt/icon?name=icons/spotlight/spotlight-waypoint-${color}.png&scale=0.9`
  }

  delivered(house: string): boolean {
    return this.currentRoute.deliveries && this.currentRoute.deliveries[house];
  }

}
