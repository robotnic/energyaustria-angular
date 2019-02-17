import { Injectable } from '@angular/core';
import { InstalledService } from './installed.service';
import { RouterTestingModule } from '@angular/router/testing';

@Injectable({
  providedIn: 'root'
})
export class LoadshifterService {
  constructor(private installedService: InstalledService) { }

  shift(data, mutate, rules, defaults, curtailment) {
    const clonedata = JSON.parse(JSON.stringify(data));
    const byName = {};
    clonedata.forEach(function(item) {
      byName[item.key] = item;
    })
    rules.loadShift.to.forEach((to) => {
      //console.log('TO',to);
      //console.log(defaults[to])
      const min = defaults[to].min || 0;
      const max = defaults[to].max || 0;
      byName['Curtailment'].values.forEach((item, i) => {
        if (item.y < 0) {

          let target =  byName[to].values[i];
          //console.log(to, item.y, target.y);
          if ((target.y + item.y) < min) {
            const oldTarget = target.y;
            target.y = min;
            const delta = oldTarget - target.y;
            item.y = item.y + delta;
          } else {
            target.y += item.y;
            item.y = 0;
          }
        }
      })
    })
    return clonedata;
  }
  addPower(data, mutate, rules, defaults, curtailment) {
    curtailment.values.forEach((item) => {
      item.y = 0;
    });
    const clonedata = JSON.parse(JSON.stringify(data))
    clonedata.forEach((item) => {
      rules.loadShift.from.forEach((rule) => {
        if (item.key === rule) {
          this.add(item, mutate[rule], curtailment);
        }
      });
    });
    clonedata.forEach(function(item) {
      if (item.key === 'Curtailment') {
        item.values = curtailment.values;
      }
    })
    return clonedata;
  }

  add(chart, value, curtailment) {
    chart.values.forEach((item, i) => {
      const delta = this.installedService.calc(item, value, chart.key);
      curtailment.values[i].y += delta;
    });
  }


}
