import { Injectable } from '@angular/core';
import { PowerService } from './power.service';
import { LoadshifterService } from './loadshifter.service';

@Injectable({
  providedIn: 'root'
})
export class CalculatorService {
  powerByName = {};
  clonedata;
  constructor(private powerService: PowerService, private loadShifter: LoadshifterService) { }


  mutate(data, modifier, rules, defaults) {
    const clonedata2 = this.loadShifter.addPower(this.clonedata, modifier, rules, defaults, this.powerByName['Curtailment']);
    const clonedata = this.loadShifter.addEV(clonedata2, modifier);
    const loadshiftedData = this.loadShifter.shift(clonedata, modifier, rules, defaults, this.powerByName['Curtailment']);
    //console.log('Kurt', this.powerByName['Curtailment'])
    return {
      modified: loadshiftedData,
      normalized: clonedata,
      original: null
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
    return this.clonedata;
  }
  createChart(d, properties) {
    const newChart = JSON.parse(JSON.stringify(this.powerByName['Lauf- und Schwellwasser']));
    newChart.key = d;
    newChart.originalKey = d;
    newChart.color = d.color;
    newChart.values.forEach(function(item) {
      item.y = 0;
    });
    //this.clonedata.push(newChart);
    this.powerByName[d] = newChart;
  }
}
