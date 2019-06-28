import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EventHandlerService } from './event-handler.service';
import { CalculatorService } from './calculator.service';
import { PowerService } from './power.service';

@Injectable({
  providedIn: 'root'
})

export class MutateService {
  data;
  observable;
  colors;
  rules = {
    loadShift: {
      'from': ['Solar', 'Wind Onshore', 'Wind Offshore'], 
      'to': ['Fossil Hard coal','Fossil Brown coal/Lignite', 'Transport', 'Fossil Gas', 'Hydro Water Reservoir', 'Biomass', 'Hydro Pumped Storage', 'Nuclear', 'Import', 'Power2Gas']
    },
    timeShift: {
      'from': ['Hydro Pumped Storage', 'Hydro Water Reservoir'],
      'to': ['Transport', 'Fossil Hard coal', 'Fossil Brown coal/Lignite', 'Fossil Gas']
    }
  };
  observe(data, ctrl) {
    this.observable = Observable.create(observer => {
      this.powerService.getDefaults().then((defaults) => {
        const allCharts = this.calculator.createCharts(data,  this.rules, defaults);
        this.data = allCharts;
        this.eventHandler.on('mutate').subscribe(async (mutate) => {
          const normalized: any =  await this.calculator.mutate(this.data, {}, this.rules, ctrl);
          const modified: any =  await this.calculator.mutate(this.data, mutate, this.rules, ctrl);
          if (normalized) {
            modified.normalized = normalized.modified;
            observer.next(modified);
          } else {
            observer.next(null);
          }
        });
      });
    });
    return this.observable;
  }

  constructor(private eventHandler: EventHandlerService, private calculator: CalculatorService, private powerService: PowerService) { }
  getRules() {
    return this.rules;
  }
  mutate() {

  }
  getMutate(data, ctrl) {
    return this.observe(data, ctrl);
  }
  /*
  doTheChanges(mutate, defaults, country) {
    return this.calculator.mutate(this.data, mutate, this.rules, defaults, country);
  }
  */
}
