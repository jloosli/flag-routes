import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImportExportComponent } from './import-export.component';
import {LayoutComponent} from '../layout/layout.component';
import {RouterModule} from '@angular/router';
import {LayoutModule} from '../layout/layout.module';
import {ImportExportService} from '../services/import-export.service';
import {HouseService} from '../services/house.service';
import {FormsModule} from '@angular/forms';
import {MdButtonModule, MdInputModule} from '@angular/material';
import {RouteService} from '../services/route.service';

@NgModule({
  imports: [
    CommonModule,
    LayoutModule,
    FormsModule,
    MdButtonModule,
    MdInputModule,
    RouterModule.forChild([
      {path: '', component: LayoutComponent, children: [
        {path: '', component: ImportExportComponent}
      ]}
    ])
  ],
  declarations: [ImportExportComponent],
  providers: [ImportExportService, HouseService, RouteService]
})
export class ImportExportModule { }
