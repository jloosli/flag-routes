import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterModule} from '@angular/router';
import { HomeComponent } from './home.component';
import {LayoutComponent} from '../layout/layout.component';
import {LayoutModule} from '../layout/layout.module';
import {HouseService} from '../services/house.service';
import {MdCardModule} from '@angular/material';
import {AgmCoreModule} from 'angular2-google-maps/core';

@NgModule({
  imports: [
    CommonModule,
    LayoutModule,
    MdCardModule,
    AgmCoreModule,
    RouterModule.forChild([
      {path: '', pathMatch: 'full', component: LayoutComponent, children: [
        {path: '', pathMatch: 'full', component: HomeComponent}
      ]}
    ])
  ],
  declarations: [HomeComponent],
  providers: [HouseService]
})
export class HomeModule { }
