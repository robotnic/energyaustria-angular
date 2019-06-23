import { Component, OnInit, Injectable, ViewEncapsulation, ViewChild, OnDestroy } from '@angular/core';
// ts-ignore
declare let d3: any;
import { InstalledService } from '../installed.service';
import { EventHandlerService } from '../event-handler.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-installed',
  templateUrl: './installed.component.html',
  styleUrls: ['./installed.component.less', '/nv.d3.css'],
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
  constructor(private installedService: InstalledService, private eventHandlerService: EventHandlerService, private http: HttpClient) {}

  async ngOnInit() {
    this.colors = await this.http.get('/assets/colors.json').toPromise();
    this.eventHandlerService.on('datechange').subscribe(data => {
      console.log('datechange', data.country);
      if (this.country !== data.country) {
        this.country = data.country;
        this.load(data.country);
      }
    })
  }
  load(country) {
    this.installedService.loadInstalled(country).then((installed: any[]) => {
      console.log('INST', installed);
      this.data.length = 0;
      const inter = {}
      // tslint:disable-next-line:forin
      const types = [];
      // tslint:disable-next-line:forin
      for (const year in installed) {
        console.log(year);
        for (const type in installed[year]) {
          console.log(type);
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
          showLegend: false
        }
      };
    });
  }

}
