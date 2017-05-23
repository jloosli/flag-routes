import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeliveryComponent } from './delivery.component';
import {RouterModule} from '@angular/router';
import {LayoutComponent} from '../layout/layout.component';
import {LayoutModule} from '../layout/layout.module';
import {HouseService} from '../services/house.service';
import {MdCheckboxModule, MdListModule} from '@angular/material';
import {ReactiveFormsModule} from '@angular/forms';
import {AgmCoreModule} from 'angular2-google-maps/core';

@NgModule({
  imports: [
    CommonModule,
    LayoutModule,
    MdListModule,
    MdCheckboxModule,
    ReactiveFormsModule,
    AgmCoreModule,
    RouterModule.forChild([
      {path: '', component: LayoutComponent, children: [
        {path: ':key', component: DeliveryComponent}
      ]}
    ])
  ],
  declarations: [DeliveryComponent],
  providers:[HouseService]
})
export class DeliveryModule { }
