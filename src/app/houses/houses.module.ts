import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HousesComponent} from './houses.component';
import {RouterModule} from '@angular/router';
import {LayoutComponent} from '../layout/layout.component';
import {LayoutModule} from '../layout/layout.module';
import {
  MdButtonModule, MdDialogModule, MdIconModule, MdInputModule, MdListModule,
  MdSelectModule
} from '@angular/material';
import {HouseService} from '../services/house.service';
import { EditHouseComponent } from './edit-house/edit-house.component';
import {FormsModule} from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    LayoutModule,
    MdListModule,
    MdDialogModule,
    MdButtonModule,
    MdIconModule,
    MdInputModule,
    MdSelectModule,
    RouterModule.forChild([
      {
        path: '', component: LayoutComponent, children: [
        {path: '', component: HousesComponent}
      ]
      }
    ])
  ],
  declarations: [HousesComponent, EditHouseComponent],
  providers: [HouseService],
  entryComponents: [EditHouseComponent]
})
export class HousesModule {
}
