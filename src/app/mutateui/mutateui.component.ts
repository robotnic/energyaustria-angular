import { Component, OnInit } from '@angular/core';
import { EventHandlerService } from '../event-handler.service';

@Component({
  selector: 'app-mutateui',
  templateUrl: './mutateui.component.html',
  styleUrls: ['./mutateui.component.less']
})
export class MutateuiComponent implements OnInit {
  mutate = {
    Wind: 0,
    Solar: 0,
    Power2Gas: 0,
    Transport: 0
  };
  constructor(private eventHandler: EventHandlerService) { }

  ngOnInit() {
    console.log('init');
    this.eventHandler.setMutate(this.mutate);
  }

  change() {
    console.log('change');
    this.eventHandler.setMutate(this.mutate);
  }

}
