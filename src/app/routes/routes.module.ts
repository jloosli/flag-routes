import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoutesComponent } from './routes.component';
import {LayoutComponent} from '../layout/layout.component';
import {RouterModule} from '@angular/router';
import {LayoutModule} from '../layout/layout.module';
import { DetailComponent } from './detail/detail.component';
import {AgmCoreModule} from 'angular2-google-maps/core';
import {MdButtonModule, MdCardModule, MdIconModule, MdListModule} from '@angular/material';
import {HouseService} from '../services/house.service';
import {DragulaModule} from 'ng2-dragula';

@NgModule({
  imports: [
    CommonModule,
    LayoutModule,
    AgmCoreModule,
    MdListModule,
    MdButtonModule,
    MdIconModule,
    MdCardModule,
    DragulaModule,
    RouterModule.forChild([
      {path: '', component: LayoutComponent, children: [
        {path: '', component: RoutesComponent},
        {path: ':id', component: DetailComponent}
      ]}
    ])
  ],
  declarations: [RoutesComponent, DetailComponent],
  providers: [HouseService]
})
export class RoutesModule { }
