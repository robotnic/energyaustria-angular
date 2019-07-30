import { Component, OnInit } from '@angular/core';
import { EventHandlerService } from '../event-handler.service';

@Component({
  selector: 'app-mutateui',
  templateUrl: './mutateui.component.html',
  styleUrls: ['./mutateui.component.less']
})
export class MutateuiComponent implements OnInit {
  timeout = null;
  mutate = {
    'Wind Onshore': 0,
    'Wind Offshore': 0,
    Solar: 0,
    Power2Gas: 0,
    Transport: 0,
    quickview: false
  };
  origMutate = null;
  constructor(private eventHandler: EventHandlerService) { }

  ngOnInit() {
    console.log('init');
    this.mutate = this.eventHandler.getState().mutate;
    console.log('init mutate ui', this.mutate);
  }

  change() {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    this.timeout = setTimeout(() => {
      this.eventHandler.setMutate(this.mutate);
    }, 200);
  }

  over() {
    this.origMutate = JSON.parse(JSON.stringify(this.mutate));
    this.mutate['Wind Onshore'] = 0;
    this.mutate['Wind Offshore'] = 0;
    this.mutate.Solar = 0;
    this.mutate.Power2Gas = 0;
    this.mutate.Transport = 0;
    this.mutate.quickview = true;
    this.eventHandler.setMutate(this.mutate);
  }

  out() {
    this.mutate = this.origMutate;
    this.mutate.quickview = false;
    this.eventHandler.setMutate(this.mutate);
  }
  inc(type) {
    let delta = 1;
    if (type === 'Transport') {
      delta = 5;
    }
    this.mutate[type] += delta;
    if (type === 'Transport' && this.mutate[type] > 100) {
      this.mutate[type] = 100;
    }
    this.change();
  }

  dec(type) {
    let delta = 1;
    if (type === 'Transport') {
      delta = 5;
    }
    this.mutate[type] -= delta;
    if (this.mutate[type] < 0) {
      this.mutate[type] = 0;
    }
    this.change();
  }
  reset() {
    let resetAlready = true;
    for(const m in this.origMutate) {
      console.log (this.origMutate[m]);
      if (this.origMutate[m]) {
        resetAlready = false;
      }
    }
    for(const m in this.mutate) {
      this.mutate[m] = 0;
    }
    this.origMutate = this.mutate;
    if (resetAlready) {
      location.hash = '';
      location.reload();
    } else {
      this.eventHandler.setMutate(this.mutate);
    }
  }

}
