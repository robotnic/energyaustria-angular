import { Injectable } from '@angular/core';
import { PowerService } from './power.service';
import { LoadshifterService } from './loadshifter.service';
import { TimeshifterService } from './timeshifter.service';

@Injectable({
  providedIn: 'root'
})
export class CalculatorService {
  powerByName = {};
  clonedata;
  constructor(
    private powerService: PowerService,
    private loadShifter: LoadshifterService,
    private timeShifter: TimeshifterService
  ) { }


  mutate(data, modifier, rules, defaults) {
    const clonedata2 = this.loadShifter.addPower(this.clonedata, modifier, rules, defaults, this.powerByName['Curtailment']);
    const clonedata = this.loadShifter.addEV(clonedata2, modifier);
    const loadshiftedData = this.loadShifter.shift(clonedata, modifier, rules, defaults, this.powerByName['Curtailment']);
    const timeshiftedData = this.timeShifter.shift(clonedata, loadshiftedData, rules, defaults);
    console.log('lsd', timeshiftedData);
    console.log('tsd', timeshiftedData);
    // console.log('Kurt', this.powerByName['Curtailment'])
    return {
      modified: timeshiftedData,
      normalized: clonedata2,
      original: data,
    };
  }

  createCharts(data,  rules, defaults) {
    const clonedata = JSON.parse(JSON.stringify(data));
    this.clonedata = [];
    this.powerByName = {};
    data.forEach((item) => {
      this.powerByName[item.key] = item;
    });
    if (defaults) {
      for (let d in defaults) {
        if (defaults.hasOwnProperty(d)) {
          if (!this.powerByName[d]) {
            this.createChart(d, defaults[d]); 
          }
        }
      }
    }
    for (let d in defaults) {
      this.clonedata.push(this.powerByName[d]);
    }
    this.calcImport();
    this.calcExport();
    return this.clonedata;
  }
  createChart(d, properties) {
    const newChart = JSON.parse(JSON.stringify(this.powerByName['Lauf- und Schwellwasser']));
    newChart.key = d;
    newChart.originalKey = d;
    newChart.color = properties.color;
    newChart.values.forEach(function(item) {
      item.y = 0;
    });
    //this.clonedata.push(newChart);
    this.powerByName[d] = newChart;
  }
  calcImport() {
    const values = [];
    this.powerByName['Import'].values.forEach((item,i) => {
      const  importValue = {
        x: item.x,
        y: 0
      };
      this.clonedata.forEach(power => {
        if (power.type === 'area') {
          importValue.y += power.values[i].y;
        }
      });
      const leistung = this.powerByName['Leistung [MW]'].values[i];
      importValue.y = leistung.y - importValue.y;
      if (importValue.y < 0) {
        importValue.y = 0;
      }
      values.push(importValue);
    });
    this.powerByName['Import'].values = values;
  }
  calcExport() {
    const values = [];
    this.powerByName['Export'].values.forEach((item,i) => {
      const  importValue = {
        x: item.x,
        y: 0
      };
      this.clonedata.forEach(power => {
        if (power.type === 'area') {
          importValue.y += power.values[i].y;
        }
      });
      const leistung = this.powerByName['Leistung [MW]'].values[i];
      importValue.y = leistung.y - importValue.y;
      if (importValue.y > 0) {
        importValue.y = 0;
      }
      values.push(importValue);
    });
    this.powerByName['Export'].values = values;
  }

}
