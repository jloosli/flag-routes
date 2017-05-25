import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeliveryComponent } from './delivery.component';
import {RouterModule} from '@angular/router';
import {LayoutComponent} from '../layout/layout.component';
import {LayoutModule} from '../layout/layout.module';
import {HouseService} from '../services/house.service';
import {
  MdButtonModule, MdCardModule, MdCheckboxModule, MdIconModule, MdInputModule, MdListModule,
  MdMenuModule
} from '@angular/material';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {AgmCoreModule} from 'angular2-google-maps/core';
import {DriverService} from '../services/driver.service';

@NgModule({
  imports: [
    CommonModule,
    LayoutModule,
    MdListModule,
    MdCheckboxModule,
    ReactiveFormsModule,
    MdCardModule,
    MdInputModule,
    MdMenuModule,
    MdButtonModule,
    MdIconModule,
    AgmCoreModule,
    RouterModule.forChild([
      {path: '', component: LayoutComponent, children: [
        {path: ':key', component: DeliveryComponent}
      ]}
    ])
  ],
  declarations: [DeliveryComponent],
  providers:[HouseService, DriverService]
})
export class DeliveryModule { }
