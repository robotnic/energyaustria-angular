import { Injectable, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';



@Injectable({
  providedIn: 'root'
})
export class StatisticsService {
  constructor( private httpClient: HttpClient) {}
  consumptionByCountry = {};
  co2;
  public async init(country) {
    this.co2 = await this.httpClient.get('/assets/co2.json').toPromise();

    return new Promise((resolve) => {
      if (this.consumptionByCountry[country]) {
          resolve(this.consumptionByCountry[country]);
      } else {
        this.httpClient.get('/api/consumtion/' + country + '/2016').subscribe(consumption => {
          this.consumptionByCountry[country] = {
            consumption: consumption,
            co2: this.co2
          };
          resolve({
            consumption: consumption,
            co2: this.co2
          });
        });
      }
    });

//    return this.httpClient.get('/theapi/consumtion/' + country + '/2016').toPromise();
  }
  public area() {
    return this.httpClient.get('/assets/countries.json').toPromise();
  }
}
