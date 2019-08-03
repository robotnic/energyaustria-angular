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
import { MatButtonModule, MatInputModule, MatDatepickerModule, MatIconModule,
  MatSelectModule, MatCardModule, MatTabsModule, MatMenuModule} from '@angular/material';
import { FormsModule, ReactiveFormsModule} from '@angular/forms';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
// ts-ignore
import 'd3';
import 'nvd3';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ManipulateConfigComponent } from './manipulate-config/manipulate-config.component';
import { MutateuiComponent } from './mutateui/mutateui.component';
import { MapComponent } from './map/map.component';
import { EnergyComponent } from './energy/energy.component';
import { PowerdiffComponent } from './powerdiff/powerdiff.component';
import { CalcrulesComponent } from './calcrules/calcrules.component';
import { StorageComponent } from './storage/storage.component';
import { HomeComponent } from './home/home.component';
import { UnitsPipe } from './units.pipe';
import { InstalledComponent } from './installed/installed.component';
import * as Hammer from 'hammerjs';
import { HammerGestureConfig, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import { YearComponent } from './year/year.component';

import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';

// the second parameter 'fr' is optional
registerLocaleData(localeFr, 'fr');


export class HammerConfig extends HammerGestureConfig {
  overrides = <any>{
    'swipe': { direction: Hammer.DIRECTION_ALL }
  };
}

@NgModule({
  declarations: [
    AppComponent,
    PowerComponent,
    DatepickerComponent,
    ManipulateConfigComponent,
    MutateuiComponent,
    MapComponent,
    EnergyComponent,
    PowerdiffComponent,
    CalcrulesComponent,
    StorageComponent,
    HomeComponent,
    UnitsPipe,
    InstalledComponent,
    YearComponent
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
    MatTabsModule,
    MatMenuModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    LeafletModule
  ],
  providers: [
    PowerService,
    EventHandlerService,
    {
      provide: HAMMER_GESTURE_CONFIG,
      useClass: HammerConfig
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  yyyymmdd = '20181111';
}
