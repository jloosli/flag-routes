import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';

const appRoutes: Routes = [
  {path: '', pathMatch: 'full', loadChildren: () => import('./home/home.module').then(m => m.HomeModule)},
  {path: 'deliveries', loadChildren: () => import('./delivery/delivery.module').then(m => m.DeliveryModule)},
  {path: 'houses', loadChildren: () => import('./houses/houses.module').then(m => m.HousesModule)},
  {path: 'routes', loadChildren: () => import('./routes/routes.module').then(m => m.RoutesModule)},
  {path: 'import-export', loadChildren: () => import('./import-export/import-export.module').then(m => m.ImportExportModule)},
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
