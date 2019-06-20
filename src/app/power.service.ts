import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class PowerService {
  promises: any[];
  data = [];
  defaults: any;
  constructor(private http: HttpClient) {}

  async getDefaults() {
    if (!this.defaults) {
      this.defaults = await this.http.get('/api/default').toPromise();
    }
    return this.defaults;
  }

  async loadENTSOECharts(ctrl) {
    console.log('CTRL', ctrl)
    var s = new Date(ctrl.date + '0000');
    console.log(s);
    var start = moment(ctrl.date);
    var end = moment(ctrl.date);

//    ctrl.timetype = 'day';
    console.log('start', start.format('YYYYMMDDHHmm'), ctrl.timetype);
    switch (ctrl.timetype) {
      case 'day':
        start = start.startOf('day');
        end = start.clone().add(1, 'd');
        break;
      case 'week':
        start = start.startOf('week').subtract(1, 'day');
        end = start.clone().add(1, 'week');
        break;
      case 'month':
        start = start.startOf('month');
        end = start.clone().add(1, 'month');
        break;
    }
    const startQuery = start.format('YYYYMMDDHHmm');
    const endQuery = end.format('YYYYMMDDHHmm');
    console.log('se', startQuery, endQuery);
    return new Promise < any[] > ((resolve, reject) => {
      console.log('THECTRL', ctrl);
      const url = '/api/generated?start=' + startQuery + '&end=' + endQuery + '&area=' + ctrl.country;
      console.log(url);
      this.http.get(url).subscribe((data: any[]) => {
        if (data) {
          data.forEach(item => {
            item.yAxis = 1;
          });
          resolve(data);
        } else {
          //resolve(null);
        }
      });
    });
  }
/* 
  async loadCharts(ctrl) {
    console.log('ctrl', ctrl);
    const dateString = ctrl.datestring;
    const reload = ctrl.reload;
    let data: any[] = [];
    this.defaults = await this.http.get('/theapi/default').toPromise();
    return new Promise < any[] > ((resolve, reject) => {
      let date = ctrl.date;
      if (dateString) {
        date = dateString;
      }
      this.promises = [
        this.loadData('AGPT', date, 1, ctrl.timetype, 'area', null, reload),
        this.loadData('AL', date, 1, ctrl.timetype, 'line', null, reload),
        this.loadData('EXAAD1P', date, 2, ctrl.timetype, 'line', function(y) {
          return y * 1000;
        }, reload)
      ];

      //      $q.all(promises).then(function(result){
      forkJoin(this.promises)
        .subscribe((responses) => {
          //          ctrl.loading = false;
          responses.forEach(function(list) {
            data = data.concat(list);
          });
          resolve(data);
        }, function(error) {
          reject(error);
        });
    });
  }

  loadData(pid, dateString, axis, timetype, type, valueCallback, reload) {
    let multiplayer = 1;
    let m = moment(dateString, 'YYYYMMDD');
    dateString = m.startOf(timetype).format('YYYYMMDD');
    const promise = new Promise((resolve, reject) => {
      // tslint:disable-next-line:quotemark
      const query = {
        'PID': pid,
        'DateString': dateString + '000000',
        'Resolution': '15M',
        'Language': 'de',
        'AdditionalFilter': 'B19|B16|B01|B04|B05|B06|B09|B10|B11|B12|B15|B17|B20|all'
      };
      if (pid === 'EXAAD1P') {
        query.AdditionalFilter = null;
        multiplayer = 1000;
      }
      this.data.length = 0;
      let url = '/api/chart/' + timetype;
      if (reload) {
        url += '?reload=true';
      }
      this.http.post(url, query).subscribe(response => {
        const charts = this.parseData(response, axis, type, this.defaults, valueCallback);
        resolve(charts);
      });
    });
    return promise;
  }

  parseData(data, axis, type, colors, valueCallback) {
    const that = this;
    const charts = [];
    const timestamps = [];
    data.d.ResponseData[1].Times.forEach(function(time, i) {
      const date = data.d.ResponseData[1].Times[i];
      const timestamp = parseInt(moment(date.DateLocalString + ' ' + date.TimeLocalFromString, "DD-MM-YYYY HH:mm").format('x'));
      timestamps.push((timestamp));
    });
    if (colors) {
      for (let c in colors) {
        data.d.ResponseData[1].DataStreams.forEach(function(item, index) {
          //format changed 
          if (item.YAxisTitle.substring(0, 5) === 'Preis') {
            item.YAxisTitle = 'Preis [EUR/MWh]';
          }
          if (item.YAxisTitle === c) {
            charts.push(parseChart(item, timestamps, index, axis, type));
          }
        });
      };
    }
    return charts;

    function parseChart(item, timestamps, index, axis, type) {
      let values = [];
      item.ValueStrings.forEach(function(value, i) {
        let xy = {
          x: timestamps[i],
          y: parseValue(value)
        }
        values.push(xy);
      });

      //hot fixes
      values.sort(function(a, b) {
        if (a.x < b.x) {
          return -1;
        };

        if (a.x > b.x) {
          return 1;
        };
        return 0;
      });

      const template = {
        key: item.YAxisTitle,
        originalKey: item.YAxisTitle,
        seriesIndex: index,
        type: type,
        values: values,
        yAxis: axis
      }
      return template;
    }

    function parseValue(value) {
      if (!value) {
        value = 0
      }
      value = value.toString();
      value = parseFloat(value.replace('.', ''));
      value = (value) / 1000;
      if (valueCallback) {
        value = valueCallback(value);
      }
      return value;
    }

  }
  */
}