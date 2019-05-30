import {Component, OnInit} from '@angular/core';
import {HouseService} from '../services/house.service';
import {Observable} from 'rxjs';
import {IRoute} from '../interfaces/route';
import {EditHouseComponent} from './edit-house/edit-house.component';
import {MatDialog} from '@angular/material';
import {filter} from 'rxjs/operators';
import {DeliveriesService} from '@flags/services/deliveries.service';

@Component({
  selector: 'app-houses',
  templateUrl: './houses.component.html',
  styleUrls: ['./houses.component.scss'],
})
export class HousesComponent implements OnInit {

  housesWithRoutes: Observable<Array<any>>;
  routes: Observable<Array<IRoute>>;

  constructor(private houseSvc: HouseService, private dialog: MatDialog, private deliveriesSvc: DeliveriesService) {
  }

  ngOnInit() {
    this.housesWithRoutes = this.houseSvc.housesWithRoutes$;
  }

  editHouse(house = {}) {
    this.dialog.open(EditHouseComponent, {data: house})
      .afterClosed()
      .pipe(
        filter(Boolean),
      )
      .subscribe(res => {
        if (res.remove) {
          this.houseSvc.removeHouse(res.remove);
        } else {
          this.houseSvc.saveHouse(res).then(house_ref => {
            if (res.route) {
              this.deliveriesSvc.addDelivery(res.route, house_ref);
            }
          });
        }
      });
  }

}
