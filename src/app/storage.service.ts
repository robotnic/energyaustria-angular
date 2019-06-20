import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor( private http: HttpClient) {}
  data = {
    xAxis: null,
    color: null
  };
  load(country, year) {
    return  new Promise<any[]>((resolve, reject) => {
      if (this.data[year]) {
        resolve(this.data[year]);
      }
      this.http.get<any>('/api/filllevel/' + country + '/' + year).subscribe(data => {
        console.log('STORAGE DATA', data);
        this.data[year] = data;
        resolve(data);
      });
    });
  }
}
