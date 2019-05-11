import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { StatisticsService } from './statistics.service';
import { PowerService } from './power.service';
import { EventHandlerService } from './event-handler.service';
import { MutateService } from './mutate.service';
import { String2HexCodeColor } from 'string-to-hex-code-color';

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
  async sankey() {
    return Observable.create(async observer => {
      this.doTheSankey(observer);
    });
  }
  async doTheSankey(observer) {
    const colors = await this.powerService.getDefaults();
    delete colors['Leistung [MW]'];
    delete colors['Preis [EUR/MWh]'];
    const statistics = await this.statisticsService.init();
    this.eventHandler.on('datechange').subscribe((data) => {
      this.loadData(data).then((ob) => {
        ob.subscribe((charts) => {
          const sum = this.makeDiff(charts);
          this.saki.links.length = 0;
          this.saki.nodes.length = 0;
          this.allNames.length = 0;
          this.pushNode('Elektrische Energie');
          this.makeNodes(colors);
          this.makeLinks(colors, sum);
          this.makeStatisticsNodes(statistics);
          this.removeUnneededNodes();
          observer.next(this.saki);
        });
      });
    });
  }

  async loadData(ctrl) {
    const observable = Observable.create(observer => {
      this.powerService.loadCharts(ctrl).then((charts) => {
        if (this.subscription) {
          this.subscription.unsubscribe();
        }
        this.subscription = this.mutateService.getMutate(charts).subscribe((mcharts) => {
          observer.next(mcharts);
        });
      });
    });
    return observable;
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
    console.log('Total', this.allElectric);
    return sum;
  }

  makeStatisticsNodes(statistics) {
    const sources = [];
    const targets = [];
    let missingTargets = true;
    // tslint:disable-next-line:forin
    statistics = this.mutateStatistices(statistics);
    let electricityUsage = 0;
    for (const s in statistics) {
      for (const t in statistics[s]) {
        if (t === 'Elektrische Energie') {
          electricityUsage -= statistics[s][t] / 1000;
        }
      }
    };
    const electricityFactor = electricityUsage / this.allElectric /1.30; //because it didn't fit todo: find the bug
 
    console.log('usage', electricityUsage / this.allElectric);
    for (const s in statistics) {
      const es = decodeURIComponent(s);
      // tslint:disable-next-line:forin
      const i = this.pushNode(es);
      // tslint:disable-next-line:forin
      for (const t in statistics[s]) {
        const j = this.pushNode(t);
        let value = statistics[s][t] * 0.277778 / 365; //TJ per year -> GWh pro day
        value = value / electricityFactor;
        this.makeStatisticsLink(i, j, value);
      }
      missingTargets = false;
    }
  }
  mutateStatistices(statistics) {
    const statatistics = JSON.parse(JSON.stringify(statistics));
    const transport = this.eventHandler.getState().mutate.Transport;
    console.log('STAT', statatistics.Traktion.Diesel, transport);
    const types = ['Traktion' , 'Standmotoren'];
    types.forEach(type => {
      const delta = {};
      for (let s in statatistics[type]) {
        if (s === 'Benzin' || s === 'Diesel') {
          const oldValue = statatistics[type][s];
          const factor = 1 - transport / 100;
          const newValue = statatistics[type][s] * factor;
          delta[s] = oldValue - newValue;
          statatistics[type][s] = newValue;
        }
      }
      statatistics.Traktion['Elektrische Energie'] += (delta['Benzin'] + delta['Diesel']) / 4;
    })
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
    if (value > 5) {
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
      let value = -sum[color].modified;
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
      if (value > 5) {
        links.push(link);
      }
    }
  }
}