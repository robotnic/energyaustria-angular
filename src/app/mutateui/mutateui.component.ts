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
    Wind: 0,
    Solar: 0,
    Power2Gas: 0,
    Transport: 0,
    quickview: false
  };
  origMutate = null;
  constructor(private eventHandler: EventHandlerService) { }

  ngOnInit() {
    console.log('init');
    //this.eventHandler.setMutate(this.mutate);
    this.mutate = this.eventHandler.getState().mutate
  }

  change() {
    console.log('change');
    if (this.timeout) {
      console.log('clear', this.timeout);
      clearTimeout(this.timeout);
    }
    this.timeout = setTimeout(() => {
      console.log('go', this.timeout);
      this.eventHandler.setMutate(this.mutate);
    }, 200);
  }

  over() {
    this.origMutate = JSON.parse(JSON.stringify(this.mutate));
    this.mutate.Wind = 0;
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

}
