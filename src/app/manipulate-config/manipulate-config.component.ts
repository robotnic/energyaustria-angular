import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MutateService } from '../mutate.service';
import { PowerService } from '../power.service';



@Component({
  selector: 'app-manipulate-config',
  templateUrl: './manipulate-config.component.html',
  styleUrls: ['./manipulate-config.component.less']
})
export class ManipulateConfigComponent implements OnInit {
  data;
  defaults;
  constructor(private http: HttpClient, private mutate: MutateService, private power: PowerService) { }

  async ngOnInit() {
    this.defaults = await this.http.get('/api/default').toPromise();
    console.log('DEFAULTS', this.defaults)
    console.log(this.mutate.rules);
    let ctrl = {
      date: '20180101',
      timetype: 'day',
      reload: false
    }
    this.data = await this.power.loadCharts(ctrl);
    console.log(this.data);
    const summs = {}
    this.data.forEach(function(item) {
      if (!summs[item.key]) {
        summs[item.key] = 0;
      }
      item.values.forEach(function(xy) {
        summs[item.key] += xy.y;
      });
    });
    console.log(summs);
  }

}
