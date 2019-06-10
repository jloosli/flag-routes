import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RoutesComponent} from './routes.component';
import {LayoutComponent} from '../layout/layout.component';
import {RouterModule} from '@angular/router';
import {LayoutModule} from '../layout/layout.module';
import {DetailComponent} from './detail/detail.component';
import {FormsModule} from '@angular/forms';
import {AgmCoreModule} from '@agm/core';
import {MaterialDesignModule} from '@flags/modules/material-design.module';
import {AddRouteComponent} from './add-route/add-route.component';
import {RouteDeliveriesModule} from '@flags/modules/route-deliveries/route-deliveries.module';

@NgModule({
  imports: [
    CommonModule,
    LayoutModule,
    FormsModule,
    AgmCoreModule,
    MaterialDesignModule,
    RouterModule.forChild([
      {
        path: '', component: LayoutComponent, children: [
          {path: '', component: RoutesComponent},
          {path: ':id', component: DetailComponent},
        ],
      },
    ]),
    RouteDeliveriesModule,
  ],
  declarations: [RoutesComponent, DetailComponent, AddRouteComponent],
  providers: [],
  entryComponents: [AddRouteComponent],
})
export class RoutesModule { }
