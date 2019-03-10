import { Component, OnInit, Injectable, ViewEncapsulation, ViewChild, OnDestroy } from '@angular/core';
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
  @ViewChild('nvd3') private nvd3: any;
  options;
  data;
  ctrl;
  colors;
  subscription;

  constructor(private powerService: PowerService,
    private eventHandler: EventHandlerService,
    private mutateService: MutateService,
    private http: HttpClient) {}

  load = async (ctrl) => {
    if (!ctrl) {
      ctrl = this.ctrl;
    }
    this.ctrl = ctrl;
    const charts = await this.powerService.loadCharts(ctrl);
    console.log('......load..........................................................................')
    if (this.subscription) {
      console.log('unscubsribe');
      this.subscription.unsubscribe();
    }
    this.subscription = this.mutateService.getMutate(charts).subscribe((response) => {
      this.setColors(response.modified);
      console.log('fertig zum rendern', response);
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

    //this.load({date: '20181111', timetype: 'day', reload: false});

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
        x: function (d) {
          return d.x;
        },
        y: function (d) {
          return d.y;
        },
        showValues: true,

        valueFormat: function (d) {
          return d3.format(',.4f')(d);
        },
        duration: 150,

        xAxis: {
          ticks:8,
          showMaxMin: false,
          tickFormat: function(d) {
            var t="0";
            let timetype = 'week'
            switch(timetype){
              case 'day':
                t= moment(d).format('HH:mm');  //d3.time.fmt(rmat('%x')(new Date(d))
                break;
              case 'week':
                t= moment(d).format('ddd DD.MMM.YYYY HH:mm');  //d3.time.fmt(rmat('%x')(new Date(d))
                break;
              default:
                t= moment(d).format('ddd DD.MMM.YYYY');  //d3.time.fmt(rmat('%x')(new Date(d))
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

  ngOnDestroy() {
    console.log('descroy');
    this.subscription.unsubscribe();
  }
}
