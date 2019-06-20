import { Injectable, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';



@Injectable({
  providedIn: 'root'
})
export class StatisticsService {
  constructor( private httpClient: HttpClient) {}
  consumption = {};
  public init(country) {
    return new Promise((resolve) => {
      if (this.consumption[country]) {
          resolve(this.consumption[country]);
      } else {
        this.httpClient.get('/api/consumtion/' + country + '/2016').subscribe(consumption => {
          this.consumption[country] = consumption;
          resolve(consumption);
        });
      }
    });

//    return this.httpClient.get('/theapi/consumtion/' + country + '/2016').toPromise();
  }
  public area() {
    return this.httpClient.get('/api/area').toPromise();
  }
}
