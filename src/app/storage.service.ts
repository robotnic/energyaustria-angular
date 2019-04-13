import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor( private http: HttpClient) {}
  data;
  load(year) {
    return  new Promise((resolve, reject) => {
      if (this.data) {
        resolve(this.data);
      }
      this.http.get('/api/storage/' + year).subscribe(data => {
        this.data = data;
        resolve(data);
      });
    });
  }
}
