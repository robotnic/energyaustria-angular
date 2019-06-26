import { Injectable } from '@angular/core';
import { InstalledService } from './installed.service';
import { StatisticsService } from './statistics.service';

@Injectable({
  providedIn: 'root'
})
export class LoadshifterService {
  constructor(
    private installedService: InstalledService,
    private statisticsService: StatisticsService
  ) {}

  shift(data, mutate, rules, defaults, installed) {
    console.log('----thestat', installed);
    const clonedata = JSON.parse(JSON.stringify(data));
    const byName = {};
    clonedata.forEach(function(item) {
      byName[item.key] = item;
    });
    defaults['Power2Gas'].min = -mutate['Power2Gas'];
    rules.loadShift.to.forEach((to) => {
      let min = 0;
      if (to === 'Hydro Pumped Storage') {
        min = -installed[to] / 1000 || 0;
      }
      const max = installed[to] / 1000 || 0;
      console.log(to, min, max);
      byName['Curtailment'].values.forEach((item, i) => {
        if (item.y < 0) {
          if (byName[to]) {
            const target = byName[to].values[i];
            if (target) {
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
          }
        }
      });
    });
    return clonedata;
  }
  addPower(data, mutate, rules, defaults, curtailment, country) {
    return new Promise(resolve => {
      curtailment.values.forEach((item) => {
        item.y = 0;
      });
      const promises = [];
      const clonedata = JSON.parse(JSON.stringify(data));
      clonedata.forEach((item) => {
        rules.loadShift.from.forEach((rule) => {
          if (item.key === rule) {
            const add = mutate[rule] || 0;
            promises.push(this.add(item, add, curtailment, mutate.quickview, country));
          }
        });
      });
      Promise.all(promises).then(result => {
        clonedata.forEach(function(item) {
          if (item.key === 'Curtailment') {
            item.values = curtailment.values;
          }
        });
        resolve(clonedata);
      });
    });
  }

  add(chart, value, curtailment, isQuickview, country) {
    return new Promise(resolve => {
      this.installedService.loadInstalled(country).then(installed => {
        chart.values.forEach((item, i) => {
          const delta = this.installedService.calc(item, value, chart.key, isQuickview, country, installed);
          if (!isNaN(delta)) {
            curtailment.values[i].y += delta;
          }
        });
        resolve(true);
      });
    });
  }

  addEV(charts, mutate, country, transportEveragePower) {
        charts.forEach(chart => {
          chart.values.forEach((item, i) => {
            if (chart.key === 'Transport') {
              item.y = transportEveragePower * mutate.Transport / 100;
            }
            if (chart.key === 'Leistung [MW]') {
              item.y += transportEveragePower * mutate.Transport / 100;
            }
          });
        });
        return charts;
  }
}