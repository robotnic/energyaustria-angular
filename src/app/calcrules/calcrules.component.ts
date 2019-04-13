import { Component, OnInit } from '@angular/core';
import { MutateService } from '../mutate.service';


@Component({
  selector: 'app-calcrules',
  templateUrl: './calcrules.component.html',
  styleUrls: ['./calcrules.component.less']
})
export class CalcrulesComponent implements OnInit {
  rules;
  constructor(private mutateService: MutateService) { }

  ngOnInit() {
    this.rules = this.mutateService.getRules();
    console.log(this.rules);
  }

}
