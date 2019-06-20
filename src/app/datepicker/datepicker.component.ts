import {Component, Input, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {MomentDateAdapter} from '@angular/material-moment-adapter';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';

// Depending on whether rollup is used, moment needs to be imported differently.
// Since Moment.js doesn't have a default export, we normally need to import using the `* as`
// syntax. However, rollup creates a synthetic default module and we thus need to import it using
// the `default as` syntax.
import * as _moment from 'moment';
import { EventHandlerService } from '../event-handler.service';
import { StatisticsService } from '../statistics.service';
// tslint:disable-next-line:no-duplicate-imports

// See the Moment.js docs for the meaning of these formats:
// https://momentjs.com/docs/#/displaying/format/
export const MY_FORMATS = {
  parse: {
    dateInput: 'LL',
  },
  display: {
    dateInput: 'LL',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

/** @title Datepicker with custom formats */
@Component({
  selector: 'app-datepicker',
  templateUrl: 'datepicker.component.html',
  styleUrls: ['datepicker.component.less'],
  providers: [
    // `MomentDateAdapter` can be automatically provided by importing `MomentDateModule` in your
    // application's root module. We provide it at the component level here, due to limitations of
    // our example generation script.
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},

    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
  ],
})

export class DatepickerComponent implements OnInit {
  timetype = 'day';
  @Input() public yyyymmdd: string;
  date: any;
  days = Array(31).fill(0).map((x, i) => i + 1);
  weeks = Array(52).fill(0).map((x, i) => i + 1);
  day = 12;
  month = 6;
  week = 6;
  year = 2018;
  country = 'Austria';
  areas;
  constructor(private eventHandler: EventHandlerService, private statisticsService: StatisticsService) {}
  ngOnInit() {
    this.load();
    this.eventHandler.on('datechange').subscribe(date => {
      console.log('\n\nsomething changed\n\n', date);
    });
  }
  load() {
    const state = this.eventHandler.getState();
    console.log(this.eventHandler.getState().datechange.timetype);
    this.timetype = state.datechange.timetype;
    this.date = state.datechange.date;
    this.country = state.datechange.country;
    this.yyyymmdd = _moment(this.date).format('YYYYMMDD');
    this.week = _moment(this.date).week();
    this.day = parseInt(this.yyyymmdd.substring(6, 8));
    this.month = parseInt(this.yyyymmdd.substring(4, 6));
    this.year = parseInt(this.yyyymmdd.substring(0, 4));
    /*
    if (this.yyyymmdd) {
      this.date = (_moment(this.yyyymmdd, 'YYYYMMDD')).toDate();
    } else {
      this.date = (_moment()).toDate();
    }
    */
    //this.onDate();
    //this.eventHandler.setDate({date: this.yyyymmdd, timetype: this.timetype});
    console.log('country?', this.country);
    this.statisticsService.area().then(areas => {
      this.areas = areas;
    });
  }
  keys(): Array<string> {
    if (this.areas) {
      return Object.keys(this.areas);
    } else {
      return [];
    }
  }
  forward(type) {
    this.date = _moment(this.date).add(1, type).toDate();
    this.onDate();
  }
  back(type) {
    this.date = _moment(this.date).subtract(1, type).toDate();
    console.log(this.date);
    this.onDate();
  }
  reload() {
    this.eventHandler.setDate({date: this.yyyymmdd, timetype: this.timetype, reload: true});
  }

  onDate() {
    this.yyyymmdd = _moment(this.date).format('YYYYMMDD');
    this.week = _moment(this.date).week();
    console.log('week', this.week);
    this.day = parseInt(this.yyyymmdd.substring(6, 8));
    this.month = parseInt(this.yyyymmdd.substring(4, 6));
    this.year = parseInt(this.yyyymmdd.substring(0, 4));
    console.log('year', this.year)
    console.log('DAY', this.day);
    this.eventHandler.setDate({date: this.yyyymmdd, timetype: this.timetype, country: this.country, reload: false});
  }
}