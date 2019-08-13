import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as moment from 'moment';



@Injectable({
  providedIn: 'root'
})
export class PriceService {

  price = {};
  constructor(private http: HttpClient) { }
  load(year, refresh) {
    return new Promise((resolve, reject) => {
      const url = '/api/price?start=' + year +  '01010000&end=' + year + '12312300&area=Switzerland&refresh=' + refresh;
      return this.http.get(url).toPromise().then(result => {
        this.cache(result[0].values);
        resolve(result);
      }, error => {
        reject(error);
      });
    });
  }
  getPriceAt(time) {
    const d = new Date(time);
    const date = d.setMinutes(0);
    return this.price[date];
  }
  cache(values) {
    console.log('cache it', values);
    values.forEach(item => {
      this.price[item.x.toString()] = item.y;
    });
    console.log('---have mondy---');
    console.log(this.price);
  }

}
