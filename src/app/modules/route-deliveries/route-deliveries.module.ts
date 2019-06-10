import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouteDeliveriesComponent} from '@flags/modules/route-deliveries/route-deliveries.component';
import {AgmCoreModule} from '@agm/core';

@NgModule({
  declarations: [RouteDeliveriesComponent],
  exports: [
    RouteDeliveriesComponent,
  ],
  imports: [
    CommonModule,
    AgmCoreModule,
  ],
})
export class RouteDeliveriesModule {
}
