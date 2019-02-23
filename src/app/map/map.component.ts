import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { latLng, tileLayer, geoJSON } from 'leaflet';
import { EventHandlerService } from '../event-handler.service';
import { deflateRaw } from 'zlib';




@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.less']
})
export class MapComponent implements OnInit {
  url = '/assets/wiesen.json';
  pv;
  defaultOverlay = null;
  options = {
    layers: [
      tileLayer("http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap contributors'
      })
    ],
    zoom: 7,
    center: latLng([ 47.879966, 12.726909 ])
  };
  constructor(private httpClient: HttpClient, private eventHandler: EventHandlerService) { }

  ngOnInit() {
  }
  onMapReady(map: Map) {
    // Do stuff with map
    this.httpClient.get(this.url).subscribe((data) => {
      this.eventHandler.on('mutate').subscribe(mutate => {
        this.draw(map, data, mutate.Solar);
      });
    });
  }

  draw(map, data, solar) {
      let total = 0;
      const installed = data.features.filter(feature=>{
        let GW = feature.properties.area * 100 / 1000 / 1000 / 1000;
        total += GW;
        if(total < solar) {
          return true;
        }
      })
      if(this.pv) {
        this.pv.remove();
      }
      this.pv = geoJSON(installed, {style: function() { 
        return {
          'color': 'black',
          'weight': 0.5
        };
      }});
      this.pv.addTo(map);
  }
}
