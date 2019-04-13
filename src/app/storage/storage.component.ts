import { Component, OnInit, ViewEncapsulation, Injectable, ViewChild } from '@angular/core';
import { StorageService } from '../storage.service';
import * as moment from 'moment';

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
  constructor(private storage: StorageService) { }

  ngOnInit() {
    this.storage.load(2017).then((data) => {
      console.log('have it', data);
      data.forEach(item => {
        item.type = 'area';
        item.yAxis = 1;
        item.key = item.key[0].de;
        const newValues = [];
        item.values.forEach(enry => {
          const o = {
            x: enry[0],
            y: enry[1]
          };
          newValues.push(o);
        })
        item.values = newValues;
      });
      data = data.filter(item => {
        return item.key === 'Österreich';
      });
      console.log('have it', data);
      this.nvd3.updateWithData(data);
    });
    this.options = {
      chart: {
        type: 'multiChart',
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
          },
          rotateLabels: 20,
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

