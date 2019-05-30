import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import * as _ from 'lodash';
import {HouseService} from '../../services/house.service';
import {IRoute} from '../../interfaces/route';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-edit-house',
  templateUrl: './edit-house.component.html',
  styleUrls: ['./edit-house.component.scss']
})
export class EditHouseComponent implements OnInit {

  house:any = {};
  routes: Observable<Array<IRoute>> = Observable.of([]);

  constructor(private dialog: MatDialogRef<EditHouseComponent>, @Inject(MAT_DIALOG_DATA) public data: any,
              private houseSvc: HouseService) {
  }

  ngOnInit() {
    this.house = {
      name: _.get(this.data, ['name'], ''),
      street: _.get(this.data, ['street'], ''),
      notes: _.get(this.data, ['notes'], ''),
      route: _.get(this.data, ['route','$key'], ''),
      $key: _.get(this.data, ['$key'], '')
    };
    this.routes = this.houseSvc.routes$
      .map((routes) => routes.sort((a, b) => a.name < b.name ? -1 : 1));
  }

  saveHouse() {
    this.dialog.close(this.house);
  }

  removeHouse() {
    this.dialog.close({remove: this.house.$key})
  }

}
