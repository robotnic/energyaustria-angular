import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PowerComponent } from './power/power.component';
import { ManipulateConfigComponent} from './manipulate-config/manipulate-config.component';
import { MapComponent} from './map/map.component';
import { EnergyComponent} from './energy/energy.component';
import { PowerdiffComponent } from './powerdiff/powerdiff.component';
import { CalcrulesComponent } from './calcrules/calcrules.component';
import { StorageComponent } from './storage/storage.component';
import { PlanComponent } from './plan/plan.component';
import { HomeComponent } from './home/home.component';

const routes: Routes = [
{path: 'power', component: PowerComponent, data: {title: 'Power'}},
{path: 'powerdiff', component: PowerdiffComponent, data: {title: 'Power deference'}},
{path: 'mutateconfig', component: ManipulateConfigComponent, data: {title: 'Config'}},
{path: 'energy', component: EnergyComponent, data: {title: 'Energy'}},
{path: 'storage', component: StorageComponent, data: {title: 'Füllstand'}},
{path: 'map', component: MapComponent, data: {title: 'Map'}},
{path: 'plan', component: PlanComponent, data: {title: 'Plan'}},
{path: 'calcrules', component: CalcrulesComponent, data: {title: 'Rules'}},
{path: '', component: HomeComponent, data: {title: 'Home'}}

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule {}

