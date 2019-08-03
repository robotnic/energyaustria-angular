import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PowerComponent } from './power/power.component';
import { ManipulateConfigComponent} from './manipulate-config/manipulate-config.component';
import { MapComponent} from './map/map.component';
import { EnergyComponent} from './energy/energy.component';
import { PowerdiffComponent } from './powerdiff/powerdiff.component';
import { CalcrulesComponent } from './calcrules/calcrules.component';
import { StorageComponent } from './storage/storage.component';
import { HomeComponent } from './home/home.component';
import { InstalledComponent } from './installed/installed.component';
import { YearComponent } from './year/year.component';

const routes: Routes = [
{path: 'power', component: PowerComponent, data: {title: 'Power'}},
{path: 'powerdiff', component: PowerdiffComponent, data: {title: 'Power change'}},
{path: 'mutateconfig', component: ManipulateConfigComponent, data: {title: 'Config'}},
{path: 'energy', component: EnergyComponent, data: {title: 'Energy'}},
{path: 'storage', component: StorageComponent, data: {title: 'Füllstand'}},
{path: 'map', component: MapComponent, data: {title: 'Map'}},
{path: 'calcrules', component: CalcrulesComponent, data: {title: 'Rules'}},
{path: 'installed', component: InstalledComponent, data: {title: 'Installed'}},
{path: 'year', component: YearComponent, data: {title: 'Year'}},
{path: '**', component: HomeComponent, data: {title: 'Home'}}

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule {}

