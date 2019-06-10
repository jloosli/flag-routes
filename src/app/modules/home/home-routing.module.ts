import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {LayoutComponent} from '../layout/layout.component';
import {HomeComponent} from './home.component';

const homeRoutes: Routes = [
  {
    path: '', pathMatch: 'full', component: LayoutComponent, children: [
      {path: '', pathMatch: 'full', component: HomeComponent},
    ],
  },
];

@NgModule({
  declarations: [],
  imports: [
    RouterModule.forChild(homeRoutes),
  ],
  exports: [
    RouterModule,
  ],
})
export class HomeRoutingModule {
}
