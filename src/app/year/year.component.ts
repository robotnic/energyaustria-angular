import { Component, OnInit, ViewChild } from '@angular/core';
import { CalcyearService } from '../calcyear.service';
import { EventHandlerService } from '../event-handler.service';

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core'
import { EnergyComponent } from '../energy/energy.component';
import { MatSort, MatTableDataSource, MatPaginator } from '@angular/material';
import { StatisticsService } from '../statistics.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-year',
  templateUrl: './year.component.html',
  styleUrls: ['./year.component.less']
})
export class YearComponent implements OnInit {
  displayedColumns: string[] = ['key', 'orig', 'origPrice', 'origCO2', 'modified', 'modifiedPrice',
  'modifiedCO2', 'price', 'delta', 'deltaPrice', 'deltaCO2'   ];
  displayedColumns2: string[] = ['key', 'orig', 'co2', 'modified', 'modifiedCO2', 'deltaCO2'];
  summaryColumns: string[] = ['name', 'orig', 'modified', 'percent', 'deltaPercent'];

  sums = {};
  sumArray = [];
  charts;
  co2;
  year = 2018;
  ctrl;
  state;
  total = {
    'co2': 0,
    'modifiedCO2': 0,
    'co2electric': 0,
    'modifiedCO2electric': 0
  };
  loading = {
    charts: false,
    energy: false,
    statistics: false,
  };
  totalArray = [];
  sumArrayTable;
  energyArrayTable;

  //@ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild(MatSort, {}) sort: MatSort;
  @ViewChild(MatSort, {}) sort2: MatSort;
  @ViewChild(MatPaginator, {}) paginator: MatPaginator;
  @ViewChild(MatPaginator, {}) paginator2: MatPaginator;


  constructor(private calcyear: CalcyearService, private eventHandler: EventHandlerService, private statisticsService: StatisticsService, private http: HttpClient) {}

  ngOnInit() {

    this.eventHandler.on('datechange').subscribe(async (ctrl) => {
      this.year = ctrl.date.substring(0, 4);
      this.ctrl = ctrl;
      this.state = this.eventHandler.getState();
      console.log(ctrl, this.eventHandler.getState());
      console.log('looking for year', ctrl.date.substring(0, 4));
    });
  }

  async generate() {
    this.total['co2'] = 0;
    this.total['modifiedCO2'] = 0;
    this.total['co2electric'] = 0;
    this.total['modifiedCO2electric'] =  0;
 
    this.loading.charts = true;
    this.charts = await this.calcyear.init(this.ctrl);
    this.loading.charts = false;
    this.loading.energy = true;
    this.calcyear.load(this.charts, this.ctrl).subscribe(sums => {
      this.loading.energy = false;
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
      this.sumArray.forEach(item => {
        this.total['co2electric'] += item.origCO2;
        if (item.modified < 0) {
          this.total['modifiedCO2electric'] -= item.modifiedCO2;
        }
        item.deltaPrice = item.modifiedPrice - item.origPrice;
      });
      console.log('sumArray', this.sumArray);
      this.sumArrayTable = new MatTableDataSource(this.sumArray) ;
      this.sumArrayTable.sort = this.sort;
//      this.sumArrayTable.paginator = this.paginator;
      this.sums = sums;
      this.makeTotalArray();
    });

    const country = this.state.datechange.country;
    console.log('give county', country);
    this.loading.statistics = true;
    this.statisticsService.init(country).then(ret => {
      this.loading.statistics = false;
      const data = ret.consumption;
      const co2 = ret.co2;
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
      let ev = 0.5;
      // tslint:disable-next-line:forin
      for (const e in energy) {
        ev = this.calcEv(e);
        energyArray.push({
          key: e,
          orig: energy[e],
          co2: energy[e] * co2[e],
          modified: energy[e] * ev,
          modifiedCO2: energy[e] * co2[e] * ev,
          deltaCO2: -energy[e] * co2[e] + energy[e] * co2[e] * ev
        });
      }
      /*
      energyArray = energyArray.sort((b, a) => {
        return (a.orig > b.orig) ? 1 : ((b.orig > a.orig) ? -1 : 0);
      });
      */
      energyArray.forEach(item => {
        if (!isNaN(item['co2'])) {
          this.total['co2'] += item.co2 / 1000;
        }
        if (!isNaN(item['modifiedCO2'])) {
          this.total['modifiedCO2'] += item.modifiedCO2 / 1000;
        }
      });
      this.makeTotalArray();
      this.energyArrayTable = new MatTableDataSource(energyArray) ;
//      this.energyArrayTable.paginator = this.paginator2;
      this.energyArrayTable.sort = this.sort2;
    });
  }

  /*
  sortElectic(event) {
    console.log(event.active, event.direction);
    console.log(this.energyArrayTable);
    this.energyArrayTable.sort = ((a, b) => {
      return a[event.active] < b[event.active];
    });
//    return true;
  }
  */

  calcEv(e) {
    let ev = 1;
    if (e === 'Gas/Diesel Oil (w/o bio)' || e === 'Motor Gasoline (w/o bio)') {
      ev = 1 - this.state.mutate.Transport / 100;
    }
    console.log(e, ev);
    return ev;
  }
  makeTotalArray() {
    console.log('arrayfy', this.total);
    const totalArray = [];
    totalArray.push({
      name: 'electric',
      orig: this.total.co2electric / 1000,
      modified: this.total.modifiedCO2electric / 1000,
      percent: this.total.modifiedCO2electric / this.total.co2electric * 100,
      deltaPercent: this.total.modifiedCO2electric / this.total.co2electric * 100 - 100
    });
    totalArray.push({
      name: 'non electric',
      orig: this.total.co2,
      modified: this.total.modifiedCO2,
      percent: this.total.modifiedCO2 / this.total.co2 * 100,
      deltaPercent: this.total.modifiedCO2 / this.total.co2 * 100 - 100
    });
    totalArray.push({
      name: 'total',
      orig: this.total.co2 + this.total.co2electric / 1000,
      modified: this.total.modifiedCO2 + this.total.modifiedCO2electric / 1000,
      percent: (this.total.modifiedCO2 + this.total.modifiedCO2electric / 1000) / (this.total.co2 + this.total.co2electric / 1000) * 100,
      deltaPercent: (this.total.modifiedCO2 + this.total.modifiedCO2electric / 1000)
      / (this.total.co2 + this.total.co2electric / 1000) * 100 - 100
    });
    //this.totalArray = new MatTableDataSource<Element>(totalArray);
    this.totalArray = totalArray;
    console.log('TOTALARRAY', this.totalArray);
  }
}