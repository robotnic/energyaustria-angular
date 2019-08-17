import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TimeshifterService {

  constructor() {}

  shift(originalData, viewdata, rules , installed) {
   // const originalData = JSON.parse(JSON.stringify(origOriginalData));
    const plan = rules.timeShift;
    const originalByName = {};
    const viewdataByName = {};
    originalData.forEach(function(chart) {
      originalByName[chart.key] = chart;
    });
    viewdata.forEach(function(chart) {
      viewdataByName[chart.key] = chart;
    });

    plan.from.forEach((fromName) => {
      let freeEnergy = this.calcFreeEnergy(originalByName[fromName], viewdataByName[fromName]);
      plan.to.forEach((toName) => {
        //console.log(fromName, '--->', toName);
        if (originalByName[fromName] && viewdataByName[fromName] && viewdataByName[toName] && installed) {
          if (freeEnergy) {
            //console.log('free', fromName, toName, freeEnergy);
          }
          freeEnergy = this.movePower(originalByName[fromName], viewdataByName[fromName], viewdataByName[toName], installed, freeEnergy);
//          originalByName[fromName] = viewdataByName[fromName];
          //console.log('excess', fromName, '-->', toName, freeEnergy);
        }
      });
    });
    return  viewdata ;
  }

  calcFreeEnergy(normalizedChart, modifiedChart) {
    //console.log('was rechnen?', normalizedChart.key, modifiedChart);
    let sum = 0;
    normalizedChart.values.forEach((item, i) => {
      sum += modifiedChart.values[i].y - item.y;
    });
    //console.log(normalizedChart.key, sum);
    return sum;
  }

  movePower(origFromChart, newFromChart, newToChart, installed, freeEnergy) {
    //console.log('origfree', freeEnergy);
    //let freeEnergy = 0;
    let maxPower = installed[origFromChart.key];
    if (isNaN(maxPower)) {
      maxPower = 0;
    }
//    console.log('maxPower', origFromChart.key, maxPower);
    origFromChart.values.forEach(function(value, i) {
      //let delta = value.y - newFromChart.values[i].y;
      //freeEnergy += delta;
      //if (newToChart && newToChart.values &&  newToChart.values[i] && newToChart.values[i].y > 0 && freeEnergy > 0) {
      if (newToChart && newToChart.values &&  newToChart.values[i] && freeEnergy < 0) {
//        console.log(newToChart.values[i], freeEnergy);
        const origY = newToChart.values[i].y;
        let shiftPower = freeEnergy; // newToChart.values[i].y;
        if (shiftPower < maxPower) {
          shiftPower = maxPower;
        }

        /*
        if (shiftPower < newFromChart.values[i].y) {
          shiftPower =  newFromChart.values[i].y;
        }
        */
        //if (origFromChart.key = 'Hydro Pumped Storage') {
        newToChart.values[i].y -= shiftPower;
        if (newToChart.values[i].y < 0) {
          newToChart.values[i].y = 0;
        }

        const newDelta = origY - newToChart.values[i].y;
        newFromChart.values[i].y += newDelta;
        freeEnergy += newDelta;
        if (newDelta !== 0) {
          //console.log(origFromChart.key, '-->', newToChart.key, newFromChart.values[i].y, shiftPower, newDelta, newToChart.values[i].y);
        }
        if (origFromChart.key === 'Hydro Pumped Storage' && newDelta !== 0) {
//          console.log(origFromChart.key, '-->', newToChart.key, origFromChart.values[i].y, shiftPower, newDelta, newToChart.values[i].y);
        }
      }
    });
    //console.log('--------mod free', freeEnergy);
    return freeEnergy;
  }

}