import { Component, OnInit, Injectable, ViewEncapsulation, ViewChild, OnDestroy } from '@angular/core';
// ts-ignore
declare let d3: any;
import { PowerService } from '../power.service';
import * as moment from 'moment';
import { EventHandlerService } from '../event-handler.service';
import { MutateService } from '../mutate.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-power',
  templateUrl: './power.component.html',
  styleUrls: ['./power.component.less',
    './nv.d3.css'
  ],
  encapsulation: ViewEncapsulation.None

})
@Injectable()

export class PowerComponent implements OnInit, OnDestroy {
  // ts-ignore
  @ViewChild('nvd3') private nvd3: any;
  options;
  data;
  ctrl;
  colors;
  subscription;
  loading = 0;

  constructor(private powerService: PowerService,
    private eventHandler: EventHandlerService,
    private mutateService: MutateService,
    private http: HttpClient) {}

  load = async (ctrl) => {
    if (!ctrl) {
      ctrl = this.ctrl;
    }
    this.ctrl = ctrl;
    this.loading++;
    const charts = await this.powerService.loadENTSOECharts(ctrl);
    this.loading--;
    //    console.log('CHARTS', charts1);
    //    const charts = await this.powerService.loadCharts(ctrl);
    this.readLayers();
    console.log('......load..........................................................................')
    if (this.subscription) {
      console.log('unscubsribe');
      this.subscription.unsubscribe();
    }
    console.log('cc', ctrl.country)
    this.subscription = this.mutateService.getMutate(charts, ctrl.country).subscribe((response) => {
      this.setColors(response.modified);
      this.readLayers(response.modified);
      console.log('fertig zum rendern', response);
      this.data = response.modified;
      this.nvd3.updateWithData(response.modified);
    });
  }

  setColors(data) {
    data.forEach(item => {
      item.color = this.colors[item.key];
    });
  }

  async ngOnInit() {
    this.colors = await this.http.get('/assets/colors.json').toPromise();
    this.eventHandler.on('datechange').subscribe((data) => {
      this.load(data);
    });
    this.eventHandler.on('view').subscribe(data => {
      console.log('layer', data);
    });

    //this.load({date: '20181111', timetype: 'day', reload: false});

    this.options = {
      chart: {

        type: 'multiChart',
        legend: {
          rightAlign: false,
          align: false,
          dispatch: {
            stateChange: (e => {
              this.legendStateChanged(e);
            })
          }

        },
        height: 850,
        margin: {
          right: 75,
          top: 120,
          bottom: 270,
          left: 75
        },
        x: function(d) {
          return d.x;
        },
        y: function(d) {
          return d.y;
        },
        showValues: true,
        valueFormat: function(d) {
          return d3.format('.5f')(d);
        },
        duration: 500,
        useInteractiveGuideline: true,
        interactiveLayer: {
          tooltip: {
            valueFormatter: function(d, i) {
//              return d3.format('.3f')(d);
              if ( !d) {
                return '';
              } else {
                return d.toFixed(1) + ' GW';
              }
            }
          }
        },
        xAxis: {
          showMaxMin: false,
          tickFormat: function(d) {
            var t = "0";
            let timetype = 'week'
            switch (timetype) {
              case 'day':
                t = moment(d).format('HH:mm'); //d3.time.fmt(rmat('%x')(new Date(d))
                break;
              case 'week':
                t = moment(d).format('ddd DD.MMM.YYYY HH:mm'); //d3.time.fmt(rmat('%x')(new Date(d))
                break;
              default:
                t = moment(d).format('ddd DD.MMM.YYYY'); //d3.time.fmt(rmat('%x')(new Date(d))
            }
            return t;
            //return d3.time.fmt(rmat('%x')(new Date(moment(d).format('DD.MMM HH:mm'))));
          },
          tickValues: function(charts) {
            var dayMS = 1000 * 60 * 60 * 24;
            var ticks = [];
            var values = charts[0].values;
            var start = values[0].x;
            var end = values[values.length - 1].x;
            var startTime = moment(start);
            var endTime = moment(end);
            var duration = moment.duration(endTime.diff(startTime)).asHours();
            var tickTime = 4;
            if(duration > 30) {
              tickTime = 24;
            }
            if(duration > 200) {
              tickTime = 24 * 7;
            }
            var days = (end - start) / dayMS;
            ticks.push(start);
            while (startTime < endTime) {
              /*
              if (days <=1) {
                start += 1000*60*60*24/6;
              } else {
                if (days <= 8) {
                  start += 1000*60*60*24;
                } else {
                  start += 1000*60*60*24 *7;
                }
              }
              */
              startTime.add(tickTime, 'h');
              ticks.push(startTime.unix() * 1000);
            }
            return ticks
          },
          rotateLabels: 20,
        },
        yAxis: {
          axisLabel: 'Y Axis',
          axisLabelDistance: -10
        },
        yAxis1: {
          tickFormat: function(d) {
            return d3.format(',.2f')(d);
          },
          axisLabel: 'GW'
        },
        yAxis2: {
          tickFormat: function(d) {
            return d3.format(',.0f')(d);
          },
          axisLabel: '€/MWh'
        },

      }
    };

  }

  legendStateChanged(e) {
    this.eventHandler.setLayers(e.disabled);
  }
  readLayers(data ? ) {
    const state = this.eventHandler.getState();
    for (let i = 0; i < state.view.layers.length; i++) {
      if (data && data[i]) {
        if (state.view.layers[i] === '1') {
          data[i].disabled = false;
        } else {
          data[i].disabled = true;
        }
      }
    }

  }
  formatDate(date) {
    var dateString = moment(date, 'YYYYMMDD').format('YYYY MMM DD');
    return dateString;
  }

  ngOnDestroy() {
    console.log('descroy');
    this.subscription.unsubscribe();
  }
}
