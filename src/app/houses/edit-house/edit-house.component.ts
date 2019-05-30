import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {HouseService} from '@flags/services/house.service';
import {IRoute} from '@flags/interfaces/route';
import {Observable, of} from 'rxjs';
import _get from 'lodash-es/get';
import {RouteService} from '@flags/services/route.service';
import {map} from 'rxjs/operators';

@Component({
  selector: 'app-edit-house',
  templateUrl: './edit-house.component.html',
  styleUrls: ['./edit-house.component.scss'],
})
export class EditHouseComponent implements OnInit {

  house: any = {};
  routes$: Observable<Array<IRoute>>;

  constructor(private dialog: MatDialogRef<EditHouseComponent>, @Inject(MAT_DIALOG_DATA) public data: any,
              private routesSvc: RouteService) {
  }

  ngOnInit() {
    this.house = {
      name: _get(this.data, ['name'], ''),
      street: _get(this.data, ['street'], ''),
      notes: _get(this.data, ['notes'], ''),
      route: _get(this.data, ['route', 'id'], ''),
      id: _get(this.data, ['id'], ''),
    };
    this.routes$ = this.routesSvc.routes$;
  }

  saveHouse() {
    this.dialog.close(this.house);
  }

  removeHouse() {
    this.dialog.close({remove: this.house.id});
  }

}
