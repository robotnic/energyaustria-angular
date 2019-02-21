import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import * as d3Sankey from 'd3-sankey';
import { PowerService } from '../power.service';
import { EventHandlerService } from '../event-handler.service';
import { MutateService } from '../mutate.service';
import { StatisticsService } from '../statistics.service';
import { Observable } from 'rxjs';
import { String2HexCodeColor } from 'string-to-hex-code-color';
import { SankeyComponent } from '../sankey/sankey.component';
import { SankeyService } from '../sankey.service';

@Component({
  selector: 'app-energy',
  templateUrl: './energy.component.html',
  styleUrls: ['./energy.component.less']
})
export class EnergyComponent implements OnInit {
  colors;
  sankey;
  saki = {
    nodes: [],
    links: []
  };
  allNames = [];
  constructor(
    private eventHandler: EventHandlerService,
    private powerService: PowerService,
    private statisticsService: StatisticsService,
    private sankeyService: SankeyService,
    private mutateService: MutateService) {}

  async ngOnInit() {
    const colors = await this.powerService.getDefaults();
    delete colors['Leistung [MW]'];
    delete colors['Preis [EUR/MWh]'];
    this.sankeyService.sankey().then(ob => ob.subscribe(data => {
      console.log('-----------the data-----------', data)
      this.saki = data;
      this.DrawChart(data);
    }));
    /*
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
          this.DrawChart(colors);
        });
      });
    });
    */

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
    console.log('statistics', statistics);
    const sources = [];
    const targets = [];
    let missingTargets = true;
    // tslint:disable-next-line:forin
    for (const s in statistics) {
      // tslint:disable-next-line:forin
      const i = this.pushNode(s);
      // tslint:disable-next-line:forin
      for (const t in statistics[s]) {
        const j = this.pushNode(t);
        this.makeStatisticsLink(i, j, parseInt(statistics[s][t] / 1000 *2.6));
      }
      missingTargets = false;
    }
  }
  makeStatisticsLink(target, source, value) {
    console.log(source, target, value);
    const string2HexCodeColor = new String2HexCodeColor();
    const color = string2HexCodeColor.stringToColor(target.toString());
    console.log(color);

    const links = this.saki.links;
    const link = {
      'source': source,
      'target': target,
      'value': value,
      'color': color,
      'type': 'base',
      'uom': 'Widget(s)'
    };
    if (value > 26) {
      links.push(link);
    }

  }

  makeNodes(colors) {
    console.log('thecolors', colors);
    const nodes = this.saki.nodes;
    // tslint:disable-next-line:forin
    for (const color in colors) {
      this.pushNode(color);
    }
  }

  pushNode(name) {
    if (this.allNames.indexOf(name) !== -1)  {
      const pos = this.allNames.indexOf(name);
      console.log(name, pos);
      console.log('----------------------------found----' + name + '---' + pos)
      return pos ;
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
      let source = count++;
      let target = 0;
      if (color === 'Curtailment' || color === 'Power2Gas') {
        target = source;
        source = 0;
      }
      const value = Math.abs(sum[color].modified  );
      const link = {
        'source': source,
        'target': target,
        'value': value,
        'color': colors[color].color,
        'type': 'base',
        'uom': 'Widget(s)'
      };
      if (value > 0) {
        links.push(link);
      }
    }

  }


  private DrawChart(colors) {

    const svg = d3.select('#sankey'),
      width = +svg.attr('width'),
      height = +svg.attr('height');
    /*
    while(svg[0].firstChild){
        svg[0].removeChidld(svg[0].firstChild)
    });
    */

    const element = svg[0][0];
    if (element && element.firstChild) {
      while (element.firstChild) {
        element.removeChild(element.firstChild);
      }
    }
    const formatNumber = d3.format(',.0f'),
      format = function(d: any) {
        return formatNumber(d) + ' GWh';
      },
      // color = d3.scaleOrdinal(d3.schemeCategory10);
      color = 'red';

    this.sankey = d3Sankey.sankey()
      .nodeWidth(15)
      .nodePadding(20)
      .extent([
        [1, 1],
        [width - 1, height - 6]
      ]);
    //  .nodeAlign(d3Sankey.sankeyLeft)
    /*
    .nodeAlign(function(data){
        console.log('nodeAlign', data);
        return
    });
    */

    let link = svg.append('g')
      .attr('class', 'links')
      .attr('fill', 'none')
      .attr('stroke', function() {
        return '#000';
      })
      .attr('stroke-opacity', 0.5)
      .selectAll('path');

    let node = svg.append('g')
      .attr('class', 'nodes')
      .attr('font-family', 'tahoma')
      .attr('font-size', 10)
      .selectAll('g');
    // d3.json('../assets/data.json', function (error, data: any) {
    const data = this.saki;
    var theValue = 9;
    console.log('kaputt', data);
    this.sankey(data);

    link = link
      .data(data.links)
      .enter().append('path')
      .attr('d', d3Sankey.sankeyLinkHorizontal())
      .attr('stroke-width', function(d: any) {
        return Math.max(1, d.width);
      })
      .attr('stroke', function(d: any) {
        let color = null;
        const name = d.source.name;
        if (colors && colors[name]) {
          color = colors[name].color;
        }
        const name2 = d.target.name;
        if (colors && colors[name2]) {
          color = colors[name2].color;
        }
        if (!color) {
          const string2HexCodeColor = new String2HexCodeColor();
          color = string2HexCodeColor.stringToColor(name + '49ou888');
        }

        return color;
        // return '#0f0'
      });

    link.append('title')
      .text(function(d: any) {
        return d.source.name + ' → ' + d.target.name + '\n' + format(d.value);
      });

    node = node
      .data(data.nodes)
      .enter().append('g');

    node.append('rect')
      .attr('x', function(d: any) {
        return d.x0;
      })
      .attr('y', function(d: any) {
        return d.y0;
      })
      .attr('height', function(d: any) {
        return d.y1 - d.y0;
      })
      .attr('width', function(d: any) {
        return d.x1 - d.x0;
      })
      .attr('fill', function(d: any) {
        let color = '#fff';
        if (colors && colors[d.name]) {
          color = colors[d.name].color;
        }else {
          const string2HexCodeColor = new String2HexCodeColor();
          color = string2HexCodeColor.stringToColor(d.name + '49ou888');
        }
        return color;
      })
      .attr('stroke', '#666');

    node.append('text')
      .attr('x', function(d: any) {
        return d.x0 - 6;
      })
      .attr('y', function(d: any) {
        return (d.y1 + d.y0) / 2;
      })
      .attr('dy', '0.35em')
      .attr('text-anchor', 'end')
      .text(function(d: any) {
        return d.name;
      })
      .filter(function(d: any) {
        return d.x0 < width / 2;
      })
      .attr('x', function(d: any) {
        return d.x1 + 6;
      })
      .attr('text-anchor', 'start');

    node.append('title')
      .text(function(d: any) {
        return d.name + '\n' + format(d.value);
      });

  }
}