import { Injectable } from '@angular/core';
import { PowerService } from './power.service';
import { LoadshifterService } from './loadshifter.service';
import { TimeshifterService } from './timeshifter.service';
import { StatisticsService } from './statistics.service';

@Injectable({
  providedIn: 'root'
})
export class CalculatorService {
  powerByName = {};
  clonedata;
  constructor(
    private powerService: PowerService,
    private loadShifter: LoadshifterService,
    private timeShifter: TimeshifterService,
    private statisticsService: StatisticsService
  ) {}

  getPetrolPower(stat) {
    const factor = 4;
    const benzin = stat['Road']['Motor Gasoline (w/o bio)'];
    const diesel = stat['Road']['Gas/Diesel Oil (w/o bio)'];
    const fuel = benzin + diesel;
    const avarageEVPower = fuel / 365 / 24 / factor;
    return avarageEVPower;
  }

  mutate(data, modifier, rules, defaults, country) {
    return new Promise(async resolve => {
      if (!data) {
        resolve(null);
        return;
      }
      this.loadShifter.addPower(this.clonedata, modifier, rules, defaults, this.powerByName['Curtailment'], country).then(clonedata2 => {
        this.statisticsService.init(country).then(stat => {
          const petrolPower = this.getPetrolPower(stat);
          const clonedata = this.loadShifter.addEV(clonedata2, modifier, country, petrolPower);
          const loadshiftedData = this.loadShifter.shift(clonedata, modifier, rules, defaults, stat);
          const timeshiftedData = this.timeShifter.shift(clonedata, loadshiftedData, rules, defaults);
          resolve({
            modified: timeshiftedData,
            normalized: clonedata2,
            original: data,
          });
        });
      });
    });
  }

  createCharts(data, rules, defaults) {
    console.log('-------------------create charts-------------');
    if (!data) {
      return null;
    }
    //    const clonedata = JSON.parse(JSON.stringify(data));
    this.clonedata = [];
    this.powerByName = {};
    const firstChart = data[0]
    defaults = ['Curtailment', 'Power2Gas'];
    defaults.forEach(d => {
      this.createEmptyChart(d, firstChart);
      this.clonedata.push(this.powerByName[d]);
    });

    data.forEach((item) => {
      this.powerByName[item.key] = item;
      this.clonedata.push(item);
    });
    defaults = ['Transport', 'Import', 'Export'];
    defaults.forEach(d => {
      this.createEmptyChart(d, firstChart);
      this.clonedata.push(this.powerByName[d]);
    });
    /*
    for (let i = 0; i < defaults.length; i++) {
      const d = defaults[i];
      this.clonedata.push(this.powerByName[d]);
    }
    */
    this.calcImport();
    this.calcExport();
    const first = 'Hydro Pumped Storage';
    this.clonedata.sort((x, y) => {
      return x.key === first ? -1 : y.key === first ? 1 : 0;
    });
    console.log(this.clonedata);
    return this.clonedata;
  }
  createEmptyChart(d, firstChart) {
    const newChart = JSON.parse(JSON.stringify(firstChart));
    newChart.key = d;
    newChart.originalKey = d;
    newChart.seriesIndex = this.clonedata.length;
    newChart.values.forEach(function(item) {
      item.y = 0;
    });
    //this.clonedata.push(newChart);
    this.powerByName[d] = newChart;
  }
  calcImport() {
    const values = [];
    this.powerByName['Import'].values.forEach((item, i) => {
      const importValue = {
        x: item.x,
        y: 0
      };
      this.clonedata.forEach(power => {
        if (power.type === 'area') {
          if (power.values[i]) {
            importValue.y += power.values[i].y;
          } else {
            console.log('calc import error', i);
          }
        }
      });
      const leistung = this.powerByName['Leistung [MW]'].values[i];
      if (leistung) {
        importValue.y = leistung.y - importValue.y;
        if (importValue.y < 0) {
          importValue.y = 0;
        }
      }
      values.push(importValue);
    });
    this.powerByName['Import'].values = values;
  }
  calcExport() {
    const values = [];
    this.powerByName['Export'].values.forEach((item, i) => {
      const importValue = {
        x: item.x,
        y: 0
      };
      this.clonedata.forEach(power => {
        if (power.type === 'area') {
          if (power.values[i]) {
            importValue.y += power.values[i].y;
          } else {
            console.log('calc export error', i);
          }
        }
      });
      const leistung = this.powerByName['Leistung [MW]'].values[i];
      if (leistung) {
        importValue.y = leistung.y - importValue.y;
        if (importValue.y > 0) {
          importValue.y = 0;
        }
      }
      values.push(importValue);
    });
    this.powerByName['Export'].values = values;
  }

}