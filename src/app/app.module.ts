import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PowerComponent } from './power/power.component';
import { PowerService } from './power.service';
import { EventHandlerService } from './event-handler.service';
import { DatepickerComponent} from './datepicker/datepicker.component';
import { NvD3Module } from 'ng2-nvd3';
import { HttpClientModule } from '@angular/common/http';
import { MomentModule } from 'ngx-moment';
import {MatButtonModule, MatInputModule, MatDatepickerModule, MatIconModule} from '@angular/material';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';


import 'd3';
import 'nvd3';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ManipulateConfigComponent } from './manipulate-config/manipulate-config.component';
import { SankeyComponent } from './sankey/sankey.component';
import { MutateuiComponent } from './mutateui/mutateui.component';
import { MapComponent } from './map/map.component';
import { EnergyComponent } from './energy/energy.component';


@NgModule({
  declarations: [
    AppComponent,
    PowerComponent,
    DatepickerComponent,
    ManipulateConfigComponent,
    SankeyComponent,
    MutateuiComponent,
    MapComponent,
    EnergyComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NvD3Module,
    HttpClientModule,
    MomentModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatInputModule,
    MatDatepickerModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    LeafletModule
  ],
  providers: [
    PowerService,
    EventHandlerService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  yyyymmdd = '20181111';
}
