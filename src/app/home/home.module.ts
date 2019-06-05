import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HomeComponent} from './home.component';
import {LayoutModule} from '../layout/layout.module';
import {AgmCoreModule} from '@agm/core';
import {MaterialDesignModule} from '@flags/modules/material-design.module';
import {HomeRoutingModule} from './home-routing.module';
import {DriversModule} from '@flags/modules/drivers/drivers.module';

@NgModule({
  imports: [
    CommonModule,
    LayoutModule,
    MaterialDesignModule,
    AgmCoreModule,
    HomeRoutingModule,
    DriversModule,
  ],
  declarations: [HomeComponent],
  providers: []
})
export class HomeModule { }
