import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PowerComponent } from './power/power.component';
import { ManipulateConfigComponent} from './manipulate-config/manipulate-config.component';
import { SankeyComponent} from './sankey/sankey.component';
import { MapComponent} from './map/map.component';

const routes: Routes = [
{path: 'power', component: PowerComponent},
{path: 'mutateconfig', component: ManipulateConfigComponent},
{path: 'sankey', component: SankeyComponent},
{path: 'map', component: MapComponent}
];
//const sankey = {path: 'sankey', component: SankeyComponent}

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
