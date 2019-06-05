import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DeliveryComponent} from './delivery.component';
import {RouterModule} from '@angular/router';
import {LayoutComponent} from '../layout/layout.component';
import {LayoutModule} from '../layout/layout.module';
import {ReactiveFormsModule} from '@angular/forms';
import {MaterialDesignModule} from '@flags/modules/material-design.module';
import {AgmCoreModule} from '@agm/core';
import {DriversModule} from '@flags/modules/drivers/drivers.module';

@NgModule({
  imports: [
    CommonModule,
    LayoutModule,
    ReactiveFormsModule,
    AgmCoreModule,
    MaterialDesignModule,
    RouterModule.forChild([
      {
        path: '', component: LayoutComponent, children: [
          {path: ':id', component: DeliveryComponent},
        ],
      },
    ]),
    DriversModule,
  ],
  declarations: [DeliveryComponent],
  providers: [],
})
export class DeliveryModule {
}
