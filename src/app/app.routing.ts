import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';

const appRoutes: Routes = [
  {path: '', pathMatch: 'full', loadChildren: () => import('app/home/home.module').then(m => m.HomeModule)},
  {path: 'deliveries', loadChildren: () => import('app/delivery/delivery.module').then(m => m.DeliveryModule)},
  {path: 'houses', loadChildren: () => import('app/houses/houses.module').then(m => m.HousesModule)},
  {path: 'routes', loadChildren: () => import('app/routes/routes.module').then(m => m.RoutesModule)},
  {path: 'import-export', loadChildren: () => import('app/import-export/import-export.module').then(m => m.ImportExportModule)},
  {path: '**', redirectTo: '/'},
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
