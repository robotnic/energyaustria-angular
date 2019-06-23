import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as moment from 'moment';


@Injectable({
  providedIn: 'root'
})
export class InstalledService {
  installed = {};
  interpolatedData = {};
  loadPromises = {};
  constructor(private httpClient: HttpClient) { }

  loadInstalled(country) {
    const that = this;
    return new Promise(resolve => {
      const url = '/api/installed/' + country;
      if (that.interpolatedData[country]) {
        resolve(that.interpolatedData[country]);
      } else {
        if (!this.loadPromises[country]) {
          this.loadPromises[country] = [];
          this.httpClient.get(url).subscribe((data) => {
            that.interpolatedData[country] = this.interpolate(data);
            resolve(that.interpolatedData[country]);
            this.loadPromises[country].forEach(res => {
              res(that.interpolatedData[country]);
            });
          });
        } else {
          this.loadPromises[country].push(resolve);
        } 
      }
    });
  }

  interpolate(data) {
    var result = {};
    const keys = Object.keys(data);
    const startYear = parseInt(keys[0]);
    const endYear = parseInt(keys.pop());
    let previous = {};
    let next = {};
    for (let k in data[startYear]) {
      previous[k] = 2 * data[startYear][k] - data[startYear + 1][k];
      next[k] = 2 * data[endYear][k] - data[endYear - 1][k];
    }
    result[startYear -1] = previous;
    for (let k in data) {
      result[k] = data[k];
    }
    result[endYear + 1] = next;
    return result;
  }

  calc(item, value, key, isQuickview, country, installed) {
//    if (!this.installed) return;
    let delta = 0;
//    const year = (new Date(item.x)).getFullYear();
//    console.log(key, new Date(item.x), new Date(item.x).getFullYear());
    const startOfYear = moment(item.x).startOf('year').unix();
    const endOfYear = moment(item.x).endOf('year').unix();
    const time = moment(item.x).unix();
    const year = moment(item.x).year();
    const installedThen = this.getInstalledAtTime(item.x, key, country, installed);
    const installedNow = this.getInstalledAtTime(new Date(), key, country, installed);
    let factor = installedNow / installedThen;
    if (isQuickview) {
      factor = 1;  //no normalization to current installation
    }
    const y = item.y;
    const addedSinceThen = y * factor - y;
    const addedNow = item.y / installedThen * value; //add 1GW
    item.y = y + addedSinceThen + addedNow;
    delta = y - item.y;
    return delta;
  }

  getInstalledAtTime(t, key, country, installed) {
    let installedPower = 0;
    const startOfYear = moment(t).startOf('year').unix();
    const endOfYear = moment(t).endOf('year').unix();
    const time = moment(t).unix();
    const year = moment(t).year();
    if (installed[year] && installed[year + 1]) {
      const startValue = installed[year][key];
      const endValue = installed[year + 1][key];
      installedPower = (startValue + (time - startOfYear) * (endValue - startValue) / (endOfYear - startOfYear)) / 1000;
    }
    return installedPower;
  }
}
