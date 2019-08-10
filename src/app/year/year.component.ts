import { Component, OnInit, ViewChild } from '@angular/core';
import { CalcyearService } from '../calcyear.service';
import { EventHandlerService } from '../event-handler.service';

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core'
import { EnergyComponent } from '../energy/energy.component';
import { MatSort, MatTableDataSource, MatPaginator } from '@angular/material';
import { StatisticsService } from '../statistics.service';

@Component({
  selector: 'app-year',
  templateUrl: './year.component.html',
  styleUrls: ['./year.component.less']
})
export class YearComponent implements OnInit {
  displayedColumns: string[] = ['key', 'orig', 'modified', 'delta'];
  displayedColumns2: string[] = ['key', 'orig'];
  sums = {};
  sumArray = [];
  charts;
  year = 2018;
  ctrl;
  sumArrayTable;
  energyArrayTable;

  //@ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild(MatSort, {}) sort: MatSort;
  @ViewChild(MatPaginator, {}) paginator: MatPaginator;


  constructor(private calcyear: CalcyearService, private eventHandler: EventHandlerService, private statisticsService: StatisticsService) {}

  ngOnInit() {

    this.eventHandler.on('datechange').subscribe(async (ctrl) => {
      this.year = ctrl.date.substring(0, 4);
      this.ctrl = ctrl;
      console.log('looking for year', ctrl.date.substring(0, 4));
    });
  }

  async generate() {
    this.charts = await this.calcyear.init(this.ctrl);
    this.calcyear.load(this.charts, this.ctrl).subscribe(sums => {
      console.log(sums);
      sums = JSON.parse(JSON.stringify(sums));
      delete sums['Leistung [MW]'];
      this.sumArray = [];
      // tslint:disable-next-line:forin
      for (const s in sums) {
        sums[s].key = s;
        sums[s].delta = -sums[s].orig - sums[s].modified;
        this.sumArray.push(sums[s]);
      }
      this.sumArray = this.sumArray.sort((a, b) => {
        return (a.modified > b.modified) ? 1 : ((b.modified > a.modified) ? -1 : 0);
      });
      this.sumArrayTable = new MatTableDataSource(this.sumArray) ;
      this.sumArrayTable.sort = this.sort;
      this.sumArrayTable.paginator = this.paginator;
      this.sums = sums;
    });
    this.statisticsService.init('Austria').then(data => {
      console.log('statdata', data);
      const energy = {};
      // tslint:disable-next-line:forin
      for (const d in data) {
        // tslint:disable-next-line:forin
        for (const t in data[d]) {
          if (!energy[t]) {
            energy[t] = 0;
          }
          energy[t] += data[d][t];
        }
      }
      console.log('energy', energy);
      let energyArray = [];
      // tslint:disable-next-line:forin
      for (const e in energy) {
        energyArray.push({
          key: e,
          orig: energy[e]
        });
      }
      energyArray = energyArray.sort((b, a) => {
        return (a.orig > b.orig) ? 1 : ((b.orig > a.orig) ? -1 : 0);
      });
      this.energyArrayTable = new MatTableDataSource(energyArray) ;
      this.energyArrayTable.sort = this.sort;
      this.energyArrayTable.paginator = this.paginator;
    });
  }

}
