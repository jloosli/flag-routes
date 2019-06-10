import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HousesComponent} from './houses.component';
import {RouterModule} from '@angular/router';
import {LayoutComponent} from '../layout/layout.component';
import {LayoutModule} from '../layout/layout.module';
import {EditHouseComponent} from './edit-house/edit-house.component';
import {FormsModule} from '@angular/forms';
import {MaterialDesignModule} from '@flags/modules/material-design.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    LayoutModule,
    MaterialDesignModule,
    RouterModule.forChild([
      {
        path: '', component: LayoutComponent, children: [
        {path: '', component: HousesComponent}
      ]
      }
    ])
  ],
  declarations: [HousesComponent, EditHouseComponent],
  providers: [],
  entryComponents: [EditHouseComponent]
})
export class HousesModule {
}
