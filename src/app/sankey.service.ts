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
  constructor(
    private statisticsService: StatisticsService,
    private eventHandler: EventHandlerService,
    private powerService: PowerService,
    private mutateService: MutateService
  ) {}
  async sankey() {
    return Observable.create(async observer => {
//      const data = await this.doTheSankey();
//      console.log(data);
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
          this.makeStatisticsNodes(statistics);
          this.makeLinks(colors, sum);
          this.removeUnneededNodes();
          observer.next(this.saki);
        });
      });
    });
  }

  async loadData(ctrl) {
    const observable = Observable.create(observer => {
      this.powerService.loadCharts(ctrl).then((charts) => {
        this.mutateService.getMutate(charts).subscribe((mcharts) => {
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
        // console.log(link, node.nodeId)
        if (link.source === node.nodeId || link.target === node.nodeId) {
          keep = true;
        }
      });
      if (!keep) {
        node.name = '';
      }
    });
    console.log('remaining nodes', this.saki.nodes);
  }


  makeDiff(charts) {
    const origList = charts.original;
    const modifiedList = charts.modified;
    const sum = {};
    origList.forEach(function(orig) {
      modifiedList.forEach(function(modified) {
        if (orig.key === modified.key) {
          orig.values.forEach((item, i) => {
            const delta = item.y - modified.values[i].y;
            if (!sum[orig.key]) {
              sum[orig.key] = {
                delta: 0,
                orig: 0,
                modified: 0
              };
            }
            sum[orig.key].delta -= delta;
            sum[orig.key].orig -= item.y;
            sum[orig.key].modified -= modified.values[i].y;
          });
        }
      });
    });
    return sum;
  }

  makeStatisticsNodes(statistics) {
    const sources = [];
    const targets = [];
    let missingTargets = true;
    // tslint:disable-next-line:forin
    for (const s in statistics) {
      const es = decodeURIComponent(s);
      // tslint:disable-next-line:forin
      const i = this.pushNode(es);
      // tslint:disable-next-line:forin
      for (const t in statistics[s]) {
        const j = this.pushNode(t);
        const value = statistics[s][t] * 0.277778 / 365; //TJ per year -> GWh pro day
        this.makeStatisticsLink(i, j, value);
      }
      missingTargets = false;
    }
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
      const value = -sum[color].modified;
      let source = count++;
      let target = 0;
      //if (color === 'Curtailment' || color === 'Power2Gas') {
      if (value < 0) {
        value = -value;
        target = source;
        source = 0;
      }
      const link = {
        'source': source,
        'target': target,
        'value': value /4,  //4 values per hour
        'color': colors[color].color,
        'type': 'base',
        'uom': 'Widget(s)'
      };
      if (value > 0) {
        links.push(link);
      }
    }

  }
}