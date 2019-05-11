import { Pipe, PipeTransform } from '@angular/core';
import { values } from 'd3';

@Pipe({
  name: 'units'
})
export class UnitsPipe implements PipeTransform {

  transform(origvalue: any, args?: any): any {
    const units = {
      power: {
        W: 1,
        kW: 1000,
        MW: 1000000,
        GW: 1000000000,
        TW: 1000000000000,
        PW: 1000000000000000,
      },
      energy: {
        Wh: 1,
        kWh: 1000,
        MWh: 1000000,
        GWh: 1000000000,
        TWh: 1000000000000,
        PWh: 1000000000000000,
      }
    };
    let resultUnit = '';
    let theU = null;
    let theValue = null;
    // tslint:disable-next-line:forin
    for (const u in units) {
      let value = origvalue;
      for (const unit in units[u]) {
        if (unit === args) {
          theValue = value * units[u][unit];
          theU = u;
        }
      }
      // value = value * 1000;
      // tslint:disable-next-line:forin
      // tslint:disable-next-line:forin
    }
    for (const u in units) {
      if (u === theU) {
        for (const unit in units[u]) {
          if (theValue  >= 1000) {
            theValue = theValue / 1000;
          } else {
            resultUnit = unit;
            break;
          }
        }
      }
 
    }
    console.log('gezählt', theU,   theValue, resultUnit);
    theValue = Math.round(theValue * 1000) / 1000;
    return '' + theValue + ' ' +resultUnit;
  }

}
