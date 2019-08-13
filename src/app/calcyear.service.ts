import { Injectable } from '@angular/core';
import { PowerService } from './power.service';
import { PriceService } from './price.service';
import { forkJoin, observable, Observable} from 'rxjs';
import { MutateService } from './mutate.service';
import { HttpClient } from '@angular/common/http';





@Injectable({
  providedIn: 'root'
})
export class CalcyearService {
  colors;
  prices;
  co2;
  constructor(private powerService: PowerService, private mutateService: MutateService, 
    private priceService: PriceService, private http: HttpClient) {}

  async init(origctrl) {
    this.prices = await this.priceService.load(2018, false);
    this.co2 = await this.http.get('/assets/co2.json').toPromise();
    console.log('co2', this.co2);
    console.log('this.prices', this.prices);
    this.playWithPrices();
    const ctrl = JSON.parse(JSON.stringify(origctrl));
    return new Promise((resolve, reject) => {
      const year = ctrl.date.substring(0, 4);
      const promises = [];
      for (let i = 1; i < 13; i++) {
        ctrl.timetype = 'month';
        let m = i.toString();
        if (i < 10) {
          m = '0' + i;
        }
        ctrl.date = year + m + '01';
        promises.push(this.powerService.loadENTSOECharts(ctrl));
      }
      forkJoin(promises).toPromise().then(result => {
        console.log('rrrr', result);
        const charts = result[0];
        for (let i = 1; i < 12; i++) {
          // tslint:disable-next-line:forin
          for (let t = 0; t < charts.length; t++) {
            try {
              charts[t].values = charts[t].values.concat(result[i][t].values);
            } catch (e) {

            }
          }
        }
        resolve(charts);
      });
    });
  }

  load(charts, ctrl) {
    return Observable.create(observer => {
      this.mutateService.getMutate(charts, ctrl).subscribe((response) => {
        observer.next(this.makeSums(response));
      });
    });
  }

  makeSums(charts) {
    console.log('charts', charts);
    const sum = {};
    // tslint:disable-next-line:forin
    for (const c in charts) {
      console.log('chart', c, charts[c]);
      charts[c].forEach(chart => {
        let co2 = 0;
        if (!isNaN(this.co2[chart.key])) {
          co2 = this.co2[chart.key];
        }
        if (!sum[chart.key]) {
          sum[chart.key] = {
            orig: 0,
            modified: 0,
            price: 0,
            origPrice: 0,
            modifiedPrice: 0,
            'origCO2': 0,
            modifiedCO2: 0
          };
        }
        chart.values.forEach((value, i) => {
          const price = this.priceService.getPriceAt(value.x);
          if (!isNaN(price)) {
            if (c === 'normalized') {
              sum[chart.key].orig += value.y  / 4;
              sum[chart.key].origPrice += value.y  / 4 * price;
              sum[chart.key].origCO2 += value.y  / 4 * co2;
            }
            if (c === 'modified') {
              sum[chart.key].modified -= value.y / 4;
              sum[chart.key].modifiedPrice -= value.y / 4 * price;
              sum[chart.key].modifiedCO2 -= value.y / 4 * co2;
            }
          }
        });
        sum[chart.key].price = sum[chart.key].origPrice / sum[chart.key].orig * 1000;
        sum[chart.key].deltaCO2 = sum[chart.key].origCO2 - sum[chart.key].modifiedCO2 ;
      });
    }
    console.log('newsum', sum);
    /*
    const sum = {
      normalized: {},
      modified: {},
    };
    // tslint:disable-next-line:forin
    for (const type in sum) {
      charts[type].forEach(chart => {
        chart.values.forEach(value => {
          if (!sum[type][chart.key]) {
            sum[type][chart.key] = 0;
          }
          if (value.y) {
            sum[type][chart.key] += value.y / 4;
          }
        });
      });
    }
    */
    return sum;
  }

  playWithPrices() {
    console.log('this.prices', this.prices.length);
    if (this.prices.length)  {
      console.log(this.prices[0]);
      this.prices[0].values.forEach(item => {
        const date = new Date(item.x);
      });
    }
  }

}
