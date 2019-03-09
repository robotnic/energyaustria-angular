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
import {MatButtonModule, MatInputModule, MatDatepickerModule, MatIconModule, MatSelectModule, MatCardModule} from '@angular/material';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';

import 'd3';
import 'nvd3';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ManipulateConfigComponent } from './manipulate-config/manipulate-config.component';
import { MutateuiComponent } from './mutateui/mutateui.component';
import { MapComponent } from './map/map.component';
import { EnergyComponent } from './energy/energy.component';
import { PowerdiffComponent } from './powerdiff/powerdiff.component';



@NgModule({
  declarations: [
    AppComponent,
    PowerComponent,
    DatepickerComponent,
    ManipulateConfigComponent,
    MutateuiComponent,
    MapComponent,
    EnergyComponent,
    PowerdiffComponent
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
    MatSelectModule,
    MatCardModule,
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
