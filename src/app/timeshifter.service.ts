import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TimeshifterService {

  constructor() {}

  // shift(originalData, viewdata, config, plan) {
  shift(originalData, viewdata, rules , defaults) {
    const plan = rules.timeShift;
    const originalByName = {};
    const viewdataByName = {};
    originalData.forEach(function(chart) {
      originalByName[chart.key] = chart;
    });
    viewdata.forEach(function(chart) {
      viewdataByName[chart.key] = chart;
    });

    plan.to.forEach((toName) => {
      plan.from.forEach((fromName) => {
        console.log(fromName, toName);
        if (originalByName[fromName] && viewdataByName[fromName] && viewdataByName[toName] && defaults) {
          this.movePower(originalByName[fromName], viewdataByName[fromName], viewdataByName[toName], defaults);
        }
      });
    });
    return  viewdata ;
  }

  movePower(origFromChart, newFromChart, newToChart, config) {
    let freeEnergy = 0;
    origFromChart.values.forEach(function(value, i) {
      const delta = value.y - newFromChart.values[i].y;
      freeEnergy += delta;
      if (newToChart && newToChart.values &&  newToChart.values[i] && newToChart.values[i].y > 0 && freeEnergy > 0) {
        const origY = newToChart.values[i].y;
        const maxPower = config[origFromChart.key].max;

        let shiftPower = freeEnergy; // newToChart.values[i].y;
        if (shiftPower > maxPower) {
          shiftPower = maxPower;
        }
        newToChart.values[i].y -= shiftPower;
        if (newToChart.values[i].y < 0) {
          newToChart.values[i].y = 0;
        }

        const newDelta = origY - newToChart.values[i].y;
        newFromChart.values[i].y += newDelta;
        freeEnergy -= newDelta;
      }
    });
    return freeEnergy;
  }

}