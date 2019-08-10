import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { StatisticsService } from './statistics.service';
import { PowerService } from './power.service';
import { EventHandlerService } from './event-handler.service';
import { MutateService } from './mutate.service';
import { String2HexCodeColor } from 'string-to-hex-code-color';

var benzin = 'Motor Gasoline (w/o bio)';
var diesel = 'Gas/Diesel Oil (w/o bio)';

@Injectable({
  providedIn: 'root'
})
export class SankeyService {
  saki = {
    nodes: [],
    links: []
  };
  allNames = [];
  subscription: any;
  allElectric = 0;
  constructor(
    private statisticsService: StatisticsService,
    private eventHandler: EventHandlerService,
    private powerService: PowerService,
    private mutateService: MutateService
  ) {}
  async sankey(sum) {
    return Observable.create(async observer => {
      this.doTheSankey(observer, sum);
    });
  }
  async doTheSankey(observer, sum) {
    const origColors = await this.powerService.getDefaults();
    const colors = JSON.parse(JSON.stringify(origColors));
    delete colors['Leistung [MW]'];
    delete colors['Preis [EUR/MWh]'];
    this.eventHandler.on('datechange').subscribe((data) => {
      this.statisticsService.init(data.country).then((statistics) => {
        delete statistics['Summe'];
        for (let s in statistics) {
          delete statistics[s].Insgesamt;
        }
        statistics = this.reduceLinks(statistics);
        this.loadData(data).then((ob) => {
          ob.subscribe((charts) => {
            const  sum2 = this.makeDiff(charts);
            console.log('sum - sum2', sum, sum2);
            this.transformToSankey(sum, colors, statistics, data);
            observer.next(this.saki);

          });
        });
      });
    });
  }

  transformToSankey(sum, colors, statistics, data) {
    this.saki = {
      links: [],
      nodes: []
    };
    this.allNames.length = 0;
    this.pushNode('Electricity');
    this.makeNodes(colors);
    this.makeLinks(colors, sum);
    this.makeStatisticsNodes(statistics, data.timetype);
    // this.bigestLinks(2);
    this.removeUnneededNodes();
  }

  reduceLinks(statistics) {
    // tslint:disable-next-line:forin
    const biggestNumbers = [];
    for (const s in statistics) {
      // tslint:disable-next-line:forin
      for (const l in statistics[s]) {
        biggestNumbers.push(statistics[s][l]);
      }
    }
    biggestNumbers.sort((a, b) => b - a);
    biggestNumbers.length = 50;
    const biggest = biggestNumbers.pop();
    for (const s in statistics) {
      // tslint:disable-next-line:forin
      for (const l in statistics[s]) {
        if (statistics[s][l] < biggest) {
          delete statistics[s][l];
        }
      }
    }
    return statistics;
  }

  async loadData(ctrl) {
    const observable = Observable.create(observer => {
      this.powerService.loadENTSOECharts(ctrl).then((charts) => {
        if (this.subscription) {
          this.subscription.unsubscribe();
        }
        this.subscription = this.mutateService.getMutate(charts, ctrl).subscribe((mcharts) => {
          observer.next(mcharts);
        });
      });
    });
    return observable;
  }
  bigestLinks(number) {
    this.saki.links = this.saki.links.sort((a, b) => {
      return b.value - a.value;
    });
    this.saki.links = this.saki.links.slice(0, number);
  }
  removeUnneededNodes() {
    this.saki.nodes.forEach((node) => {
      let keep = false;
      this.saki.links.forEach((link) => {
        if (link.source === node.nodeId || link.target === node.nodeId) {
          keep = true;
        }
      });
      if (!keep) {
        node.name = '';
      }
    });
    /*
    this.saki.nodes.forEach((node, i) => {
      if (i > 20) {
        node.name = '';
      }
    });
    */
    /*
     this.saki.nodes = this.saki.nodes.filter(node => {
       return node.name !== '';
     });
     */
  }

  makeDiff(charts) {
    const origList = charts.original;
    const modifiedList = charts.modified;
    const sum = {};
    this.allElectric = 0;
    origList.forEach((orig) => {
      sum[orig.key] = {
        delta: 0,
        orig: 0,
        modified: 0
      };
      modifiedList.forEach((modified) => {
        if (orig.key === modified.key) {
          orig.values.forEach((item, i) => {
            let hours = 0;
            if (modified.values[i - 1]) {
              const one = modified.values[i - 1].x;
              const two = modified.values[i].x;
              hours = (two - one) / 3600 / 1000;
            }
            const delta = item.y - modified.values[i].y;
            sum[orig.key].delta -= delta * hours;
            sum[orig.key].orig -= item.y * hours;
            sum[orig.key].modified -= modified.values[i].y * hours;
          });
        }
      });
      if (orig.type === 'area') {
        this.allElectric += sum[orig.key].modified;
      }
    });
    return sum;
  }

  makeStatisticsNodes(statistics, timetype) {
    const sources = [];
    const targets = [];
    let missingTargets = true;
    // tslint:disable-next-line:forin
    statistics = this.mutateStatistices(statistics);
    let electricityUsage = 0;
    for (const s in statistics) {
      for (const t in statistics[s]) {
        if (t === 'Electricity') {
          electricityUsage -= statistics[s][t] / 1000;
        }
      }
    };
    const electricityFactor = 1; //electricityUsage / this.allElectric /1.30; //because it didn't fit todo: find the bug

    let theLinks = [];
    for (const s in statistics) {
      const es = decodeURIComponent(s);
      // tslint:disable-next-line:forin
      const i = this.pushNode(es);
      // tslint:disable-next-line:forin
      for (const t in statistics[s]) {
        const j = this.pushNode(t);
        let value = statistics[s][t]; // 365; //GWh per year -> GWh pro day
        if (timetype === 'week') {
          value = value * 7;
        }
        if (timetype === 'month') {
          value = value * 30;
        }
        value = value / electricityFactor;
        //        this.makeStatisticsLink(i, j, value);
        theLinks.push({
          i: i,
          j: j,
          value: value
        });
      }
      missingTargets = false;
    }
    theLinks.forEach(link => {
      this.makeStatisticsLink(link.i, link.j, link.value);
    });
  }
  mutateStatistices(statistics) {
    const statatistics = JSON.parse(JSON.stringify(statistics));
    const transport = this.eventHandler.getState().mutate.Transport;
    const types = ['Road'];
    types.forEach(type => {
      const delta = {};
      for (let s in statatistics[type]) {
        if (s === benzin || s === diesel) {
          const oldValue = statatistics[type][s];
          const factor = 1 - transport / 100;
          const newValue = statatistics[type][s] * factor;
          delta[s] = oldValue - newValue;
          statatistics[type][s] = newValue;
        }
      }
      if (!statatistics.Road['Electricity']) {
        statatistics.Road['Electricity'] = 0;
      }
      statatistics.Road['Electricity'] += (delta[benzin] + delta[diesel]) / 4; // fix me, remove factor
    });
    return statatistics;
  }
  makeStatisticsLink(target, source, value) {
    const string2HexCodeColor = new String2HexCodeColor();
    const color = string2HexCodeColor.stringToColor(target.toString());

    const links = this.saki.links;
    const link = {
      'source': source,
      'target': target,
      'value': value,
      'color': color,
      'type': 'base',
      'uom': 'Widget(s)'
    };
    if (link.value) {
      links.push(link);
    }

  }

  makeNodes(colors) {
    const nodes = this.saki.nodes;
    // tslint:disable-next-line:forin
    for (const color in colors) {
      this.pushNode(color);
    }
  }

  pushNode(name) {
    if (this.allNames.indexOf(name) !== -1) {
      const pos = this.allNames.indexOf(name);
      return pos;
    }
    this.allNames.push(name);
    const l = this.saki.nodes.length;
    const node = {
      nodeId: l,
      name: name
    };
    this.saki.nodes.push(node);
    return l;
  }

  makeLinks(colors, sum) {
    let count = 1;
    const links = this.saki.links;
    // tslint:disable-next-line:forin
    for (const color in colors) {
      let value = 0;
      if (sum[color]) {
        value = -sum[color].modified;
      }
      let source = count++;
      let target = 0;
      if (value < 0) {
        value = -value;
        target = source;
        source = 0;
      }
      const link = {
        'source': source,
        'target': target,
        'value': value, //4 values per hour
        'color': colors[color].color,
        'type': 'base',
        'uom': 'Widget(s)'
      };
      if (link.value) {
        links.push(link);
      }
    }
  }
}