import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as moment from 'moment';


@Injectable({
  providedIn: 'root'
})
export class InstalledService {
  installed = {};
  constructor(private httpClient: HttpClient) { 
    this.init(2015);
  }
  init(year) {
      this.getYear(year);
    //http://localhost:5000/data/installed/2019 
  }

  getYear(year) {
    const url = '/api/data/installed/' + year;
    this.httpClient.get(url).subscribe((data) => {
      this.installed[year] = {};
      // tslint:disable-next-line:forin
        for (let p in data)  {
          const item = data[p];
          this.installed[year][item.Title] = item.Value;
        }
      if (year < (new Date()).getFullYear()) {
        this.init(year + 1);
      } else {
        this.installed[year + 1] = {};
        for (let p in this.installed[year]) {
          this.installed[year + 1][p] = this.installed[year][p] * 2 - this.installed[year - 1][p] 
        }
      }
    });
  }

  calc(item, value, key) {
    if (!this.installed) return;
    let delta = 0;
//    const year = (new Date(item.x)).getFullYear();
//    console.log(key, new Date(item.x), new Date(item.x).getFullYear());
    const startOfYear = moment(item.x).startOf('year').unix();
    const endOfYear = moment(item.x).endOf('year').unix();
    const time = moment(item.x).unix();
    const year = moment(item.x).year();
    if (this.installed[year] && this.installed[year +1]) {
      const startValue = this.installed[year][key];
      const endValue = this.installed[year + 1][key];
      const installed = (startValue + (time - startOfYear) * (endValue - startValue) / (endOfYear - startOfYear)) / 1000;
      const y = item.y;
      item.y = (installed + value) / installed * item.y;
      delta = y - item.y;
    }
    return delta;
  }
}
