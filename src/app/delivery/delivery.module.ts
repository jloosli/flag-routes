import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DeliveryComponent} from './delivery.component';
import {RouterModule} from '@angular/router';
import {LayoutComponent} from '../layout/layout.component';
import {LayoutModule} from '../layout/layout.module';
import {ReactiveFormsModule} from '@angular/forms';
import {MaterialDesignModule} from '@flags/modules/material-design.module';
import {AgmCoreModule} from '@agm/core';

@NgModule({
  imports: [
    CommonModule,
    LayoutModule,
    ReactiveFormsModule,
    MaterialDesignModule,
    AgmCoreModule,
    RouterModule.forChild([
      {
        path: '', component: LayoutComponent, children: [
          {path: ':id', component: DeliveryComponent},
        ],
      },
    ]),
  ],
  declarations: [DeliveryComponent],
  providers: [],
})
export class DeliveryModule {
}
