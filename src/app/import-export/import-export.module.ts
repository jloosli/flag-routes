import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ImportExportComponent} from './import-export.component';
import {LayoutComponent} from '../layout/layout.component';
import {RouterModule} from '@angular/router';
import {LayoutModule} from '../layout/layout.module';
import {FormsModule} from '@angular/forms';
import {MaterialDesignModule} from '@flags/modules/material-design.module';

@NgModule({
  imports: [
    CommonModule,
    LayoutModule,
    FormsModule,
    MaterialDesignModule,
    RouterModule.forChild([
      {path: '', component: LayoutComponent, children: [
        {path: '', component: ImportExportComponent}
      ]}
    ])
  ],
  declarations: [ImportExportComponent],
  providers: []
})
export class ImportExportModule { }
