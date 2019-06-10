import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BroadcastComponent} from '@flags/modules/drivers/broadcast/broadcast.component';
import {ReactiveFormsModule} from '@angular/forms';
import {MaterialDesignModule} from '@flags/modules/material-design.module';
import {DriverTokensComponent} from './driver-tokens/driver-tokens.component';
import {AgmCoreModule} from '@agm/core';

@NgModule({
  declarations: [BroadcastComponent, DriverTokensComponent],
  exports: [
    BroadcastComponent,
    DriverTokensComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialDesignModule,
    AgmCoreModule,
  ],
})
export class DriversModule {
}
