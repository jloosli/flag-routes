import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';

const appRoutes: Routes = [
  {path: '', pathMatch: 'full', loadChildren: () => import('./modules/home/home.module').then(m => m.HomeModule)},
  {path: 'deliveries', loadChildren: () => import('./modules/delivery/delivery.module').then(m => m.DeliveryModule)},
  {path: 'houses', loadChildren: () => import('./modules/houses/houses.module').then(m => m.HousesModule)},
  {path: 'routes', loadChildren: () => import('./modules/routes/routes.module').then(m => m.RoutesModule)},
  {path: 'import-export', loadChildren: () => import('./modules/import-export/import-export.module').then(m => m.ImportExportModule)},
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
