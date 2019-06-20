import { Component, OnInit, ViewEncapsulation, Injectable, ViewChild } from '@angular/core';
import { StorageService } from '../storage.service';
import * as moment from 'moment';
import { EventHandlerService } from '../event-handler.service';

declare let d3: any;


@Component({
  selector: 'app-storage',
  templateUrl: './storage.component.html',
  styleUrls: ['./storage.component.less',
    './nv.d3.css'
  ],
  encapsulation: ViewEncapsulation.None

})

@Injectable()
export class StorageComponent implements OnInit {
  @ViewChild('nvd3') private nvd3: any;

  options;
  data = [];
  constructor(private storage: StorageService, private eventHandler: EventHandlerService) { }

  ngOnInit() {
    this.eventHandler.on('datechange').subscribe((data) => {
      console.log('DADADA', data);
      this.load(data.country, data.date.substring(0, 4));
    });
  }
  load(country, year) {
    this.data = [];
    this.storage.load(country, year).then((data) => {
      data['xAxis'] = 1;
      data['color'] = 'red';
      this.data.push(data);
      console.log('have it', data);
      this.nvd3.updateWithData(this.data);
    });
    this.options = {
      chart: {
        type: 'lineChart',
        legend: { rightAlign: false, align: false },
        height: 650,
        margin: {
          top: 120,
          right: 40,
          bottom: 70,
          left: 75
        },
        showValues: true,

        valueFormat: function (d) {
          return d3.format(',.4f')(d);
        },
        duration: 150,
        xAxis: {
          ticks:8,
          showMaxMin: false,
          rotateLabels: 20,
          tickFormat: function(d) {
            return moment(d).format('ddd DD.MMM.YYYY');  //d3.time.fmt(rmat('%x')(new Date(d))
            //return d3.time.fmt(rmat('%x')(new Date(moment(d).format('DD.MMM HH:mm'))));
          }
        },
        yAxis: {
          axisLabel: 'Y Axis',
          axisLabelDistance: -10
        },
        yAxis1: {
          tickFormat: function (d) {
            return d3.format(',.1f')(d);
          },
          axisLabel: 'GW'
        },
      }
    };

  }
}

