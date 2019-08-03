import { Injectable } from '@angular/core';
import { PowerService } from './power.service';
import { forkJoin, observable, Observable} from 'rxjs';
import { MutateService } from './mutate.service';





@Injectable({
  providedIn: 'root'
})
export class CalcyearService {
  colors;
  constructor(private powerService: PowerService, private mutateService: MutateService) {}

  async init(origctrl) {
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
        const charts = result[0];
        for (let i = 1; i < 12; i++) {
          // tslint:disable-next-line:forin
          for (let t = 0; t < charts.length; t++) {
            charts[t].values = charts[t].values.concat(result[i][t].values);
          }
        }
        resolve(charts);
      });
    });
  }

  load(charts, ctrl) {
    return Observable.create(observer => {
      console.log('Tatah', charts);
      this.mutateService.getMutate(charts, ctrl).subscribe((response) => {
        observer.next(this.makeSums(response));
      });
    });
  }

  makeSums(response) {
    const sum = {
      normalized: {},
      modified: {},
    };
    // tslint:disable-next-line:forin
    for (const type in sum) {
      response[type].forEach(chart => {
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

    return sum;
  }

}
