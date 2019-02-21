import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import * as d3Sankey from 'd3-sankey';
import { String2HexCodeColor } from 'string-to-hex-code-color';
import { PowerService } from '../power.service';
import { EventHandlerService } from '../event-handler.service';
import { MutateService } from '../mutate.service';
import { StatisticsService } from '../statistics.service';

@Component({
  selector: 'app-sankey',
  templateUrl: './sankey.component.html',
  styleUrls: ['./sankey.component.less']
})
export class SankeyComponent implements OnInit {
  allCharts = null;
  rules = null;
  statistics = null;
  colors;
  that = this;
  saki = {
    nodes: [{
      nodeId: 0,
      name: 'Changes'
    }],
    links: []
  };
  sankey;
  constructor(private powerService: PowerService, private eventHandler: EventHandlerService,
    private mutateService: MutateService, private statictics: StatisticsService) {}

  async ngOnInit(): Promise < void > {
    this.rules = await this.mutateService.getRules();

    this.powerService.getDefaults().then((colors) => {
      this.colors = colors;
    });

    // this.makeNodes(this.rules)
    this.eventHandler.on('datechange').subscribe((data) => {
      this.loadData(data);
    });
    this.statistics = await this.statictics.init();
    console.log('----------got from service-------', this.statistics)
  }

  async loadData(ctrl) {
    const charts = await this.powerService.loadCharts(ctrl);
    console.log('charts', charts);
    this.allCharts = null;
    this.mutateService.getMutate(charts).subscribe((response) => {
      console.log('-----------da');
      if (!this.allCharts) {
        this.allCharts = response;
      }
      //      this.nvd3.updateWithData(response);
      const sum = this.makeDiff(this.allCharts, response);
      this.saki.links = [];
      this.saki.nodes = [];
      const direct = this.makeNodes(sum);
      console.log(this.saki.nodes);
      this.makeLinks(sum, direct);
      this.makeLinksRenewable(sum, direct);
      //      this.makeLinks(sum, direct)
      // this.removeUnneededNodes();
      this.DrawChart(this.colors);
    });
    // this.DrawChart();
  }

  removeUnneededNodes() {

    this.saki.nodes = this.saki.nodes.filter((node) => {
      let keep = false;
      this.saki.links.forEach((link) => {
        // console.log(link, node.nodeId)
        if (link.source === node.nodeId || link.target === node.nodeId) {
          console.log('keep', node.nodeId, node.name);
          keep = true;
        }
      });
      return keep;
    });
    console.log('remaining nodes', this.saki.nodes);
  }

  makeLinks(sum, direct) {
    for (const s in sum) {
      if (!s.startsWith('Preis') && !s.startsWith('Leistung')) {
        let value = Math.abs(sum[s].modified);
        if (s === 'Solar' || s === 'Wind' || s === 'Power2Gas') { //ugly
          value = Math.abs(sum[s].orig);
        }

        let source = direct.left[s];
        const target = direct.right[s];
        if (s === 'Curtailment') {
          source = 0;
        }
        const link = {
          'source': source,
          'target': target,
          'value': value,
          'color': 'red',
          'type': 'base',
          'uom': 'Widget(s)'
        };

        if (link.value) {
          this.saki.links.push(link);
        }
      }
    }
  }
  makeLinksRenewable(sum, direct) {
    // this.saki.links = [];
    this.rules.loadShift.from.forEach((item) => {
      this.saki.nodes.forEach((node) => {
        if (item === node.name) {
          const source = direct.left[item];
          const link = {
            'source': source,
            'target': 0,
            'value': Math.abs(sum[node.name].delta),
            'color': 'red',
            'uom': 'Widget(s)'
          };
          if (link.value > 0) {
            this.saki.links.push(link);
          }
        }
      });
    });
    this.rules.loadShift.to.forEach((item) => {
      this.saki.nodes.forEach((node) => {
        if (item === node.name) {
          const link = {
            'source': 0,
            'target': direct.right[item],
            'value': Math.abs(sum[node.name].delta),
            'uom': 'Widget(s)'
          };
          if (link.value > 0) {
            this.saki.links.push(link);
          }
        }
      });
    });
    /*
    this.allCharts.forEach(element => {
      this.saki.nodes.forEach((node) => {
        if (element.key === node.name) {
          var link = {
            "target": 0,
            "source": node.nodeId,
            "value": -sum[node.name],
            "uom": "Widget(s)"
          }
          console.log('element', element);
        }
      });
    });
    */

  }

  makeNodes(sum) {
    const kickKeys = ['Preis [EUR/MWh]', 'Leistung [MW]', 'Öl', 'Sonstige Erneuerbare', 'Geothermie'];
    this.saki.nodes = [{
      nodeId: 0,
      name: 'Changes'
    }];
    const direct = {
      left: {},
      right: {}
    };
    let count = this.saki.nodes.length;
    this.allCharts = this.allCharts.filter((chart) => {
      if (kickKeys.indexOf(chart.key) !== -1) {
        return false;
      }
      return true;
    });
    if (this.allCharts) {
      this.allCharts.forEach((chart) => {
        this.saki.nodes.push({
          nodeId: count,
          name: chart.key,
        });
        direct.left[chart.key] = count;
        count++;
      });
      this.allCharts.forEach((chart) => {
        this.saki.nodes.push({
          nodeId: count,
          name: chart.key,
        });
        direct.right[chart.key] = count;
        count++;
      });
    }
    return direct;

    /*
    for (var type in this.rules.loadShift) {
      console.log(type, this.rules.loadShift[type])
      this.rules.loadShift[type].forEach((rule) => {
        console.log(rule);
        this.saki.nodes.push({
          nodeId: count++,
          name: rule
        })
      })
    }
    */
  }

  makeDiff(origList, modifiedList) {
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

  private DrawChart(colors) {
    const string2HexCodeColor = new String2HexCodeColor();

    const svg = d3.select('#sankey'),
      width = +svg.attr('width'),
      height = +svg.attr('height');
    /*
    while(svg[0].firstChild){
        svg[0].removeChidld(svg[0].firstChild)
    });
    */

    const element = svg[0][0];
    if (element.firstChild) {
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
      .nodePadding(10)
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
        let color = '#eee';
        const name = d.source.name;
        if (colors && colors[name] && d.index > theValue) {
          color = colors[name].color;
        }
        const name = d.target.name;
        if (colors && colors[name] && d.index > theValue) {
          color = colors[name].color;
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
        }
        return color;
        //        return string2HexCodeColor.stringToColor(d.name);
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

    this.link = link;
  }
}