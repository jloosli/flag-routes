import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImportExportComponent } from './import-export.component';
import {LayoutComponent} from '../layout/layout.component';
import {RouterModule} from '@angular/router';
import {LayoutModule} from '../layout/layout.module';

@NgModule({
  imports: [
    CommonModule,
    LayoutModule,
    RouterModule.forChild([
      {path: '', component: LayoutComponent, children: [
        {path: '', component: ImportExportComponent}
      ]}
    ])
  ],
  declarations: [ImportExportComponent]
})
export class ImportExportModule { }
