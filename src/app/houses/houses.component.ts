import {Component, OnInit} from '@angular/core';
import {HouseService} from '../services/house.service';
import {IHouse} from '../interfaces/house';
import {Observable} from 'rxjs';
import {IRoute} from '../interfaces/route';
import {EditHouseComponent} from './edit-house/edit-house.component';
import {MatDialog, MatDialogRef} from '@angular/material';

@Component({
  selector: 'app-houses',
  templateUrl: './houses.component.html',
  styleUrls: ['./houses.component.scss']
})
export class HousesComponent implements OnInit {

  housesWithRoutes: Observable<Array<any>>;
  routes: Observable<Array<IRoute>>;

  constructor(private houseSvc: HouseService, private dialog: MatDialog) {
  }

  ngOnInit() {
    this.housesWithRoutes = this.houseSvc.housesWithRoutes$;
  }

  editHouse(house = {}) {
    this.dialog.open(EditHouseComponent, {data: house})
      .afterClosed()
      .subscribe(res => {
        if (res) {
          if (res.remove) {
            this.houseSvc.removeHouse(res.remove);
          } else {
            this.houseSvc.saveHouse(res).then(house_key=> {
              if(res.route) {
                this.houseSvc.addHouseToRoute(res.route, house_key);
              }
            });
          }
        }
      });
  }

}
