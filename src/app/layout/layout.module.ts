import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutComponent } from './layout.component';
import {RouterModule} from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { NavComponent } from './nav/nav.component';
import {MdIconModule, MdToolbarModule, MdTooltipModule} from '@angular/material';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    MdToolbarModule,
    MdIconModule,
    MdTooltipModule
  ],
  declarations: [LayoutComponent, HeaderComponent, NavComponent]
})
export class LayoutModule { }
