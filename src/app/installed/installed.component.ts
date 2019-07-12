import { Component, OnInit, Injectable, ViewEncapsulation, ViewChild, OnDestroy } from '@angular/core';
// ts-ignore
declare let d3: any;
import { InstalledService } from '../installed.service';
import { EventHandlerService } from '../event-handler.service';
import { HttpClient } from '@angular/common/http';
import { parse } from 'url';

@Component({
  selector: 'app-installed',
  templateUrl: './installed.component.html',
  styleUrls: ['./installed.component.less', './nv.d3.css'],
  encapsulation: ViewEncapsulation.None

})

@Injectable()

export class InstalledComponent implements OnInit {
  @ViewChild('nvd3') private nvd3: any;
  data = [];
  options;
  country;
  year;
  colors;
  originalInstalled;
  constructor(private installedService: InstalledService, private eventHandlerService: EventHandlerService, private http: HttpClient) {}

  async ngOnInit() {
    this.colors = await this.http.get('/assets/colors.json').toPromise();
    this.eventHandlerService.on('datechange').subscribe(data => {
      console.log('datechange', data.country);
      if (this.country !== data.country) {
        this.country = data.country;
        this.load(data.country);
      }
    });
    /*
    this.eventHandlerService.on('mutate').subscribe(mutate => {
      console.log('something has to happen', mutate);
      if (this.originalInstalled) {
        const installed = this.mutate(this.originalInstalled, mutate);
        this.parse(installed);
      }
    });
    */
  }
  load(country) {
    this.installedService.loadInstalled(country).then((installed: any[]) => {
      this.originalInstalled = installed;
      this.eventHandlerService.on('mutate').subscribe(mutate => {
        console.log('something has to happen', mutate);
        if (this.originalInstalled) {
          const inst= this.mutate(this.originalInstalled, mutate);
          this.parse(inst);
        }
      });
  
      let state = this.eventHandlerService.getState();
      console.log('THE MUTATE', state.mutate);
      const newinstalled = this.mutate(installed, state.mutate);
      this.parse(newinstalled);
    });
  }

  mutate(originstalled, mutate) {
    let installed = JSON.parse(JSON.stringify(originstalled));
    console.log('-----------------mutate---------------', installed);
    // tslint:disable-next-line:forin
    for (const m in mutate) {
//      console.log(m, mutate[m], installed[m]);
      for (const y in installed) {
        if (installed[y][m]) {
          installed[y][m] = installed[y][m] + mutate[m] * 1000;
        }
      }
    }
    return installed;
  }

  parse(installed) {
//    this.originalInstalled = installed;
    console.log('INST', installed);
    this.data.length = 0;
    const inter = {}
    // tslint:disable-next-line:forin
    const types = [];
    // tslint:disable-next-line:forin
    for (const year in installed) {
      for (const type in installed[year]) {
        if (types.indexOf(type) === -1) {
          types.push(type);
        }
      }
    }
    for (const year in installed) {
      const values = [];
      // tslint:disable-next-line:forin
      for (const t in types) {
        const type = types[t];
        const value = {
          x: year,
          y: installed[year][type] || 0,
          color: this.colors[type]
        };
        if (!inter[type]) {
          inter[type] = {
            key: type,
            values: []
          };
        }
        inter[type].values.push(value);
      }
    }
    console.log(inter);
    // tslint:disable-next-line:forin
    for (const item in inter) {
      this.data.push(inter[item]);
    }
    console.log(this.data);
    // this.options = nv.models.multiBarChart();
    this.options = {
      chart: {
        type: 'multiBarChart',
        stacked: true,
        height: 850,
        showLegend: false,
        yAxis: {
          tickFormat: function(d) {
            return d3.format(',.2f')(d / 1000);
          },
          axisLabel: 'GW'
        }
      }
    };
  }

}