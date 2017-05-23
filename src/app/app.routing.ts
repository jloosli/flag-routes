import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';

const appRoutes: Routes = [
  {path: '', pathMatch: 'full', loadChildren: 'app/home/home.module#HomeModule'},
  {path: 'deliveries', loadChildren: 'app/delivery/delivery.module#DeliveryModule'},
  {path: 'houses', loadChildren: 'app/houses/houses.module#HousesModule'},
];

@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule {
}
