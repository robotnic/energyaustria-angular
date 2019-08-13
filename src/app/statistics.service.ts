import { Injectable, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface Stat {
  consumption: object;
  co2: object;
}

@Injectable({
  providedIn: 'root'
})

export class StatisticsService {
  constructor( private httpClient: HttpClient) {}
  consumptionByCountry: {[name: string]: Stat} = {};
  co2: object;
  public async init(country) {
    return new Promise<Stat>(async (resolve) => {
      this.co2 = await this.httpClient.get('/assets/co2.json').toPromise();
      if (this.consumptionByCountry[country]) {
          resolve(this.consumptionByCountry[country]);
      } else {
        const consumption = await this.httpClient.get('/api/consumtion/' + country + '/2016').toPromise();
        const stat: Stat = {
          consumption: consumption,
          co2: this.co2
        };
        this.consumptionByCountry[country] = stat;
        resolve(stat);
      }
    });

//    return this.httpClient.get('/theapi/consumtion/' + country + '/2016').toPromise();
  }
  public area() {
    return this.httpClient.get('/assets/countries.json').toPromise();
  }
}
