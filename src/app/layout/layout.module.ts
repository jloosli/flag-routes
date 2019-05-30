import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutComponent } from './layout.component';
import {RouterModule} from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { NavComponent } from './nav/nav.component';
import {MaterialDesignModule} from '@flags/modules/material-design.module';

@NgModule({
  imports: [
    CommonModule,
    MaterialDesignModule,
    RouterModule,
  ],
  declarations: [LayoutComponent, HeaderComponent, NavComponent]
})
export class LayoutModule { }
