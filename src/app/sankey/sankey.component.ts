import {
  Component,
  OnInit
} from '@angular/core';
import * as d3 from 'd3';
import * as d3Sankey from 'd3-sankey';
import {
  String2HexCodeColor
} from 'string-to-hex-code-color';
import {
  PowerService
} from '../power.service';
import {
  EventHandlerService
} from '../event-handler.service';
import {
  MutateService
} from '../mutate.service';
import { KeyEventsPlugin } from '@angular/platform-browser/src/dom/events/key_events';


@Component({
  selector: 'app-sankey',
  templateUrl: './sankey.component.html',
  styleUrls: ['./sankey.component.less']
})
export class SankeyComponent implements OnInit {
  allCharts = null;
  rules = null;
  colors;
  that = this;
  saki = {
    nodes: [
        {nodeId: 0, name: 'Changes'}
    ],
    links: []
  };
  sankey;
  constructor(private powerService: PowerService, private eventHandler: EventHandlerService, private mutateService: MutateService) {}

  async ngOnInit(): Promise < void > {
    this.rules = await this.mutateService.getRules();

    this.powerService.getDefaults().then((colors) => {
        console.log('aaa', colors);
        this.colors = colors;
    });

    //this.makeNodes(this.rules)
    console.log(this.saki)
    this.eventHandler.on('datechange').subscribe((data) => {
      this.loadData(data);
    });
  }

  async loadData(ctrl) {
    const charts = await this.powerService.loadCharts(ctrl);
    this.allCharts = null;
    this.mutateService.getMutate(charts).subscribe((response) => {
        console.log('-----------da')
      if (!this.allCharts) {
        this.allCharts = response;
      }
      console.log('charts', this.allCharts)
      console.log('response', response)
      //      this.nvd3.updateWithData(response);
      let sum = this.makeDiff(this.allCharts, response);
      console.log('SUM', sum);
      this.saki.nodes = [];
      let direct = this.makeNodes(sum)
        this.saki.links = [];
      this.makeLinks(sum, direct)
      this.makeLinks2(sum, direct)
//      this.makeLinks(sum, direct)
      //this.removeUnneededNodes();
      console.log('sake', this.saki)
      console.log('sake2', this.sankey)
      console.log('sake.colors', this.colors)
      this.DrawChart(this.colors);
    });
    //this.DrawChart();
  }

  removeUnneededNodes() {

    this.saki.nodes = this.saki.nodes.filter((node) => {
        let keep = false;
        this.saki.links.forEach((link) => {
            //console.log(link, node.nodeId)
            if (link.source === node.nodeId || link.target === node.nodeId) {
                console.log('keep', node.nodeId, node.name)
                keep = true;
            }
        });
        return keep;
    });
    console.log('remaining nodes',this.saki.nodes)
  }

  makeLinks(sum, direct) {
    for (let s in sum) {
      if (!s.startsWith('Preis') && !s.startsWith('Leistung')) {
        let value = sum[s];
        console.log(s,value)
        let source = direct.left[s];
        let target = direct.right[s];
        console.log(source, target, value.modified);
        let link = {
                "source": source,
                "target": target,
                "value": Math.abs(sum[s].orig),
                "color": "red",
                "uom": "Widget(s)"
        }
        console.log('makelines', link)
        if (link.value) {
            this.saki.links.push(link)
        }
      }
    }
    console.log(this.saki.links)
  }
  makeLinks2(sum, direct) {
    console.log('SUMMM', sum, this.rules.loadShift);
    //this.saki.links = [];
    this.rules.loadShift.from.forEach((item) => {
      this.saki.nodes.forEach((node) => {
        if (item === node.name) {
          console.log(node);
          var link = {
            "source": 0,
            "target": direct.right[item],
            "value": Math.abs(sum[node.name].delta),
            "color": "red",
            "uom": "Widget(s)"
          }
          if (link.value > 0) {
            this.saki.links.push(link);
          }
        }
      })
    })
    this.rules.loadShift.to.forEach((item) => {
      this.saki.nodes.forEach((node) => {
        if (item === node.name) {
          var link = {
            "source": direct.left[item],
            "target": 0,
            "value": Math.abs(sum[node.name].delta),
            "uom": "Widget(s)"
          }
          if (link.value > 0) {
            this.saki.links.push(link);
          }
        }
      })
    })
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
    console.log('RULES', this.rules.loadShift);
    this.saki.nodes = [
        {nodeId:0, name: 'Changes'}
    ]
    let direct = {
        left: {},
        right: {}
    };
    let count = this.saki.nodes.length;
    if (this.allCharts) {
        this.allCharts.forEach((chart) => {
            this.saki.nodes.push({
                nodeId: count,
                name: chart.key,
            })
            direct.left[chart.key] = count;
            count++;
        })
        this.allCharts.forEach((chart) => {
            this.saki.nodes.push({
                nodeId: count,
                name: chart.key,
            })
            direct.right[chart.key] = count;
            count++;
        })
    }
    console.log('FFFF',this.saki)
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
    const sum = {}
    origList.forEach(function (orig) {
      modifiedList.forEach(function (modified) {
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
      console.log('are this colors?', colors)
    const string2HexCodeColor = new String2HexCodeColor();

    const svg = d3.select('#sankey'),
      width = +svg.attr('width'),
      height = +svg.attr('height');
    /*
    while(svg[0].firstChild){
        svg[0].removeChidld(svg[0].firstChild)
    });
    */

    console.log('savg', svg[0][0])
    const element = svg[0][0]
    if (element.firstChild) {
        while (element.firstChild) {
        element.removeChild(element.firstChild);
        }
    }
    const formatNumber = d3.format(',.0f'),
      format = function (d: any) {
        return formatNumber(d) + ' GWh';
      },
      //color = d3.scaleOrdinal(d3.schemeCategory10);
      color = 'red';

    this.sankey = d3Sankey.sankey()
      .nodeWidth(15)
      .nodePadding(20)
      .extent([
        [1, 1],
        [width - 1, height - 6]
      ])
    //  .nodeAlign(d3Sankey.sankeyLeft)
      /*
      .nodeAlign(function(data){
          console.log('nodeAlign', data);
          return 
      });
      */
      console.log('d3', d3)
      console.log('d3.sankeyRight', this.sankey)


    let link = svg.append('g')
      .attr('class', 'links')
      .attr('fill', 'none')
      .attr('stroke', function() {
          return '#000'
      })
      .attr('stroke-opacity', 0.2)
      .selectAll('path');

    let node = svg.append('g')
      .attr('class', 'nodes')
      .attr('font-family', 'tahoma')
      .attr('font-size', 10)
      .selectAll('g');
    //d3.json('../assets/data.json', function (error, data: any) {
    let data = this.saki;

console.log('kaputt', data)
    this.sankey(data);


    link = link
      .data(data.links)
      .enter().append('path')
      .attr('d', d3Sankey.sankeyLinkHorizontal())
      .attr('stroke-width', function (d: any) {
        return Math.max(1, d.width);
      });

    link.append('title')
      .text(function (d: any) {
        return d.source.name + ' → ' + d.target.name + '\n' + format(d.value);
      });

    node = node
      .data(data.nodes)
      .enter().append('g');


    node.append('rect')
      .attr('x', function (d: any) {
        return d.x0;
      })
      .attr('y', function (d: any) {
        return d.y0;
      })
      .attr('height', function (d: any) {
        return d.y1 - d.y0;
      })
      .attr('width', function (d: any) {
        return d.x1 - d.x0;
      })
      .attr('fill', function (d: any) {
          let color = '#fff'
          if(colors && colors[d.name]){
            color =  colors[d.name].color
            console.log(d.name, color);
          }
          return color;
//        return string2HexCodeColor.stringToColor(d.name);
      })
      .attr('stroke', '#666');

    node.append('text')
      .attr('x', function (d: any) {
        return d.x0 - 6;
      })
      .attr('y', function (d: any) {
        return (d.y1 + d.y0) / 2;
      })
      .attr('dy', '0.35em')
      .attr('text-anchor', 'end')
      .text(function (d: any) {
        return d.name;
      })
      .filter(function (d: any) {
        return d.x0 < width / 2;
      })
      .attr('x', function (d: any) {
        return d.x1 + 6;
      })
      .attr('text-anchor', 'start');

    node.append('title')
      .text(function (d: any) {
        return d.name + '\n' + format(d.value);
      });

    this.link = link;
  }
}
