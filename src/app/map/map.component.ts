import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { latLng, tileLayer, geoJSON } from 'leaflet';




@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.less']
})
export class MapComponent implements OnInit {
  url = '/assets/wiesen.json';
  defaultOverlay = null;
  options = {
    layers: [
      tileLayer("http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap contributors'
      })
    ],
    zoom: 7,
    center: latLng([ 48.879966, 14.726909 ])
  };
  constructor(private httpClient: HttpClient) { }

  ngOnInit() {
    this.httpClient.get(this.url).subscribe((data) => {
      console.log(data);
//      this.defaultOverlay = geoJSON(data);
    });
  }
  onMapReady(map: Map) {
    // Do stuff with map
    console.log(map);
    this.httpClient.get(this.url).subscribe((data) => {
      const pv = geoJSON(data, {style: function() { 
        return {
          'color': 'black',
          'weight': 0.5
        };
      }})
      pv.addTo(map);
    })
  }
}
