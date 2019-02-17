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
  constructor(private eventHandler: EventHandlerService) {}
  ngOnInit() {
    if (this.yyyymmdd) {
      this.date = (_moment(this.yyyymmdd, 'YYYYMMDD')).toDate();
    } else {
      this.date = (_moment()).toDate();
    }
    this.eventHandler.setDate({date: this.yyyymmdd, timetype: this.timetype});
  }
  forward() {
    this.date = _moment(this.date).add(1, 'days').toDate();
    this.onDate();
  }
  back() {
    _moment(this.date).subtract(1, 'days');
    this.date = _moment(this.date).subtract(1, 'days').toDate();
    this.onDate();
  }
  onDate() {
    this.yyyymmdd = _moment(this.date).format('YYYYMMDD');
    this.eventHandler.setDate({date: this.yyyymmdd, timetype: this.timetype, reload: false});
  }
}