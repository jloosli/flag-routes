import {Component, Input, OnInit} from '@angular/core';
import {Delivery} from '@flags/interfaces/delivery';
import {DocumentReference} from '@angular/fire/firestore';
import {DeliveriesService} from '@flags/services/deliveries.service';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-route-deliveries',
  templateUrl: './route-deliveries.component.html',
  styleUrls: ['./route-deliveries.component.scss'],
})
export class RouteDeliveriesComponent implements OnInit {

  @Input() routeRef: DocumentReference;
  deliveries$: Observable<Delivery[]>;

  constructor(private deliveriesSvc: DeliveriesService) {
  }

  ngOnInit() {
    this.deliveries$ = this.deliveriesSvc.getRouteDeliveries(this.routeRef, {withHouses: true});
  }

  getIndexLetter(idx: number): string {
    return String.fromCharCode(65 + idx);
  }

  iconUrl(delivery: Delivery): string {
    const color = delivery.delivered ? 'a' : 'b'; // a = green b= red
    return `https://mt.google.com/vt/icon?name=icons/spotlight/spotlight-waypoint-${color}.png&scale=0.9`;
  }


}
