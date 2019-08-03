import { Component, OnInit } from '@angular/core';
import { CalcyearService } from '../calcyear.service';
import { EventHandlerService } from '../event-handler.service';

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core'
import { EnergyComponent } from '../energy/energy.component';

@Component({
  selector: 'app-year',
  templateUrl: './year.component.html',
  styleUrls: ['./year.component.less']
})
export class YearComponent implements OnInit {
  sums = {};
  charts;
  year = 2018;
  ctrl;
  constructor(private calcyear: CalcyearService, private eventHandler: EventHandlerService) {}

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
      this.sums = sums;
    });
  }

}
