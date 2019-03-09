import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PowerComponent } from './power/power.component';
import { ManipulateConfigComponent} from './manipulate-config/manipulate-config.component';
import { MapComponent} from './map/map.component';
import { EnergyComponent} from './energy/energy.component';
import { PowerdiffComponent } from './powerdiff/powerdiff.component';

const routes: Routes = [
{path: 'power', component: PowerComponent, data: {title: 'Power'}},
{path: 'powerdiff', component: PowerdiffComponent, data: {title: 'Power deference'}},
{path: 'mutateconfig', component: ManipulateConfigComponent, data: {title: 'Config'}},
{path: 'energy', component: EnergyComponent, data: {title: 'Energy'}},
{path: 'map', component: MapComponent, data: {title: 'Map'}}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
