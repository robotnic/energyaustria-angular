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
      if (!this.observers[eventtype]) {
        this.observers[eventtype] = [];
      }
      this.observers[eventtype].push(observer);
      if (this.state[eventtype]) {
        console.log(this.state);
        this.getStateHash();
        observer.next(this.state[eventtype]);
      }
    });
    return source  ;
  }
  off(eventtype) {
    this.observers[eventtype].complete();
  }
  /*
  on = Observable.
    callback => {
      console.log('observe callback', callback)
    }
  })
  */

  setDate(dateobj) {
    return this.setObserver('datechange', dateobj);
  }
  setMutate(mutate) {
    return this.setObserver('mutate', mutate);
  }
  setObserver(name, value) {
    this.state[name] = value;
    if (this.observers[name]) {
      this.observers[name].forEach(function(observer) {
        observer.next(value);
      });
    }
  }
  getStateHash() {
    console.log(this.state);
  }
}
