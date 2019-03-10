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
import { HttpClient } from '@angular/common/http';
import { getClosureSafeProperty } from '@angular/core/src/util/property';

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
    private mutateService: MutateService,
    private http: HttpClient) {}

  async ngOnInit() {
    this.sankeyService.sankey().then(ob => ob.subscribe(data => {
      this.saki = data;
      this.DrawChart(data);
    }));
  }

  getColor(d, colors) {
    let color = null;
    color = colors[d.name];
    if (d.source) {
      const name = d.source.name;
      if (colors && colors[name]) {
        color = colors[name];
      }
    }
    if (d.target && !color) {
      const name2 = d.target.name;
      if (colors && colors[name2]) {
        color = colors[name2];
      }
    }
    if (!color) {
      const string2HexCodeColor = new String2HexCodeColor();
      color = string2HexCodeColor.stringToColor(name + '49ou888');
    }
    return color;
  }



  private async DrawChart(sankeyData) {
    const colors = await this.http.get('/assets/colors.json').toPromise();
    const svg = d3.select('#sankey'),
      width = +svg.attr('width'),
      height = +svg.attr('height');
    /*
    while(svg[0].firstChild){
        svg[0].removeChidld(svg[0].firstChild)
    });
    try {
      const element = svg[0][0];
      if (element && element.firstChild) {
        while (element.firstChild) {
          element.removeChild(element.firstChild);
        }
      }
    } catch (e) {}
    */
    d3.selectAll("svg > *").remove();

    const formatNumber = d3.format(',.0f'),
      format = function(d: any) {
        return formatNumber(d) + ' GWh';
      },
      //color = d3.scaleOrdinal(d3.schemeCategory10);
      color = 'red';

    this.sankey = d3Sankey.sankey()
      .nodeWidth(15)
      .nodePadding(10)
      .xScale(d3.time.scale())
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
      .attr('font-family', 'Sans-Serif')
      .attr('font-size', 10)
      .selectAll('g');
    // d3.json('../assets/data.json', function (error, data: any) {
    const data = this.saki;
    this.sankey(data);

    link = link
      .data(data.links)
      .enter().append('path')
      .attr('d', d3Sankey.sankeyLinkHorizontal())
      .attr('class','energysankey')
      .attr('stroke-width', function(d: any) {
        return Math.max(1, d.width);
      })
      .attr('stroke', (d: any) => {
        return this.getColor(d, colors);
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
      .attr('fill', (d: any) => {
        /*
        let color = '#fff';
        if (sankeyData && sankeyData[d.name]) {
          color = sankeyData[d.name].color;
        } else {
          const string2HexCodeColor = new String2HexCodeColor();
          color = string2HexCodeColor.stringToColor(d.name + '49ou888');
        }
        */
        return this.getColor(d, colors);
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