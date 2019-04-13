import { Injectable } from '@angular/core';
import { InstalledService } from './installed.service';

@Injectable({
  providedIn: 'root'
})
export class LoadshifterService {
  constructor(private installedService: InstalledService) { }

  shift(data, mutate, rules, defaults, curtailment) {
    console.log('mutate', mutate);
    const clonedata = JSON.parse(JSON.stringify(data));
    const byName = {};
    clonedata.forEach(function(item) {
      byName[item.key] = item;
    });
    defaults['Power2Gas'].min = -mutate['Power2Gas'];
    rules.loadShift.to.forEach((to) => {
      const min = defaults[to].min || 0;
      const max = defaults[to].max || 0;
      byName['Curtailment'].values.forEach((item, i) => {
        if (item.y < 0) {

          const target =  byName[to].values[i];
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
      });
    });
    return clonedata;
  }
  addPower(data, mutate, rules, defaults, curtailment) {
    curtailment.values.forEach((item) => {
      item.y = 0;
    });
    const clonedata = JSON.parse(JSON.stringify(data));
    clonedata.forEach((item) => {
      rules.loadShift.from.forEach((rule) => {
        if (item.key === rule) {
          const add = mutate[rule] || 0;
          this.add(item, add, curtailment, mutate.quickview);
        }
      });
    });
    clonedata.forEach(function(item) {
      if (item.key === 'Curtailment') {
        item.values = curtailment.values;
      }
    });
    return clonedata;
  }

  add(chart, value, curtailment, isQuickview) {
    chart.values.forEach((item, i) => {
      const delta = this.installedService.calc(item, value, chart.key, isQuickview);
      curtailment.values[i].y += delta;
    });
  }

  addEV(charts, mutate) {
    charts.forEach(chart => {
      chart.values.forEach((item, i) => {
        if (chart.key === 'Transport') {
          item.y = 4 * mutate.Transport / 100;
        }
        if (chart.key === 'Leistung [MW]') {
          item.y += 4 * mutate.Transport / 100;
        }
      });
    });
    return charts;
  }
}
