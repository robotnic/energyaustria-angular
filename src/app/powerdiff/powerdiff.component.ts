/*
import { Component, OnInit, ViewChild } from '@angular/core';
import { PowerService } from '../power.service';
import { EventHandlerService } from '../event-handler.service';
import { MutateService } from '../mutate.service';
import { HttpClient } from '@angular/common/http';
import * as moment from 'moment';
*/

import { Component, OnInit, Injectable, ViewEncapsulation, ViewChild, OnDestroy } from '@angular/core';
declare let d3: any;
import { PowerService } from '../power.service';
import * as moment from 'moment';
import { EventHandlerService } from '../event-handler.service';
import { MutateService } from '../mutate.service';
import { HttpClient } from '@angular/common/http';



@Component({
  selector: 'app-powerdiff',
  templateUrl: './powerdiff.component.html',
  styleUrls: ['./powerdiff.component.less', './nv.d3.css'],
    encapsulation: ViewEncapsulation.None
})

@Injectable()
export class PowerdiffComponent implements OnInit, OnDestroy {

  @ViewChild('nvd3') private nvd3: any;
  options;
  data;
  ctrl;
  colors;
  subscription;
  loading = false;

  constructor(private powerService: PowerService,
    private eventHandler: EventHandlerService,
    private mutateService: MutateService,
    private http: HttpClient) {}

  load = async (ctrl) => {
    if (!ctrl) {
      ctrl = this.ctrl;
    }
    this.ctrl = ctrl;
    this.loading = true;
    let charts = await this.powerService.loadENTSOECharts(ctrl);
    this.loading = false;
    console.log('CHARTS', charts);
    // ts-ignore
    charts = charts.filter(chart => {
      if (chart.key === 'Preis [EUR/MWh]' || chart.key === 'Leistung [MW]' ) {
        console.log('filtered', chart.key);
        return false;
      }
      return true;
    });
    console.log('......load..........................................................................')
    if (this.subscription) {
      console.log('unscubsribe');
      this.subscription.unsubscribe();
    }
    this.subscription = this.mutateService.getMutate(charts, ctrl.country).subscribe((response) => {
      this.makeDelta(response);
      this.setColors(response.diff);
      this.readLayers(response.diff);
      this.nvd3.updateWithData(response.diff);
    });
  }

  setColors(data) {
    data.forEach(item => {
      item.color = this.colors[item.key];
    });
  }

  makeDelta(response) {
    response.diff = JSON.parse(JSON.stringify(response.modified));
    response.normalized.forEach((item, i) => {
      this.makeDiff(item, response.diff[i]);
    });
  }

  makeDiff(orig, mod) {
    orig.values.forEach((item, i) => {
      mod.values[i].y -= item.y;
      if (isNaN(mod.values[i].x)) {
        console.log('NaN', mod.values);
      }
    });
    mod.type = 'line';
    if (mod.key === 'Transport' || mod.key === 'Curtailment') {
      //mod.type = 'area';  //looks nice, but doesn't work
    }
  }

  async ngOnInit() {
       this.colors = await this.http.get('/assets/colors.json').toPromise();
    this.eventHandler.on('datechange').subscribe((data) => {
      this.load(data);
    });

    //this.load({date: '20181111', timetype: 'day', reload: false});

    this.options = {
      duration: 300,
      useInteractiveGuideline: true,
      chart: {
        type: 'multiChart',
        legend: {
          rightAlign: false,
          align: false,
          dispatch: {
            stateChange: (e => {
              console.log(111);
              this.legendStateChanged(e);
            })
          }
        },
        height: 650,
        margin: {
          top: 120,
          right: 40,
          bottom: 230,
          left: 75
        },
        x: function (d) {
          return d.x;
        },
        y: function (d) {
          return d3.format(',.3f')(d.y);
        },
        showValues: true,

        valueFormat: function (d) {
          return d3.format(',.4f')(d);
        },
        duration: 150,

        useInteractiveGuideline: true,
        xAxis: {
          ticks:8,
          showMaxMin: false,
          tickFormat: function(d) {
            let t = "0";
            let timetype = 'week'
            switch(timetype){
              case 'day':
                t = moment(d).format('HH:mm');  //d3.time.fmt(rmat('%x')(new Date(d))
                break;
              case 'week':
                t = moment(d).format('ddd DD.MMM.YYYY HH:mm');  //d3.time.fmt(rmat('%x')(new Date(d))
                break;
              default:
                t = moment(d).format('ddd DD.MMM.YYYY');  //d3.time.fmt(rmat('%x')(new Date(d))
            }
          return t;
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
        yAxis2: {
          tickFormat: function (d) {
            return d3.format(',.1f')(d);
          },
          axisLabel: '€/MWh'
        },

      }
    };

  }

  legendStateChanged(e) {
    console.log('changed-----------', e.disabled);
    this.eventHandler.setLayers(e.disabled);
  }
  readLayers(data) {
    const state = this.eventHandler.getState();
    console.log('diffstate', state)
    for (let i = 0; i < state.view.layers.length; i++) {
      if (data && data[i]) {
        if (state.view.layers[i] === '1') {
          data[i].disabled = false;
        } else {
          data[i].disabled = true;
        }
      }
    }
    console.log('diffdata', data)
  }
  ngOnDestroy() {
    console.log('destroy');
    this.subscription.unsubscribe();
  }

}
