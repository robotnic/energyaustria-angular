import {
  Injectable
} from '@angular/core';
import {
  Observable
} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventHandlerService {
  events: any[];
  observers = {};
  state = {};
  constructor() {}
  on(eventtype) {
    const source = Observable.create((observer) => {
      console.log('.................', this.state, eventtype)
      if (!this.observers[eventtype]) {
        this.observers[eventtype] = [];
      }
      this.observers[eventtype].push(observer);
      if (this.state[eventtype]) {
        observer.next(this.state[eventtype]);
      }
    });
    return source  ;
  }
  /*
  on = Observable.
    callback => {
      console.log('observe callback', callback)
    }
  })
  */

  setDate(dateobj) {
    this.state['datechange'] = dateobj;
    if (this.observers['datechange']) {
      this.observers['datechange'].forEach(function(observer){
        observer.next(dateobj);
      });
    }
  }
  setMutate(mutate) {
    this.state['mutate'] = mutate;
    if (this.observers['mutate']) {
      this.observers['mutate'].forEach(function(observer) {
        observer.next(mutate);
      });
    }
    console.log(mutate);
  }
}
