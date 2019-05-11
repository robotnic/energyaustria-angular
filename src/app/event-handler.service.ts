import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import * as _moment from 'moment';


@Injectable({
  providedIn: 'root'
})
export class EventHandlerService {
  events: any[];
  layers: [];
  observers = {};
  state = {
    'datechange': {
      'date': _moment().format('YYYYMMDD'),
      'timetype': 'day',
      'reload': false
    },
    'mutate': {
      'Wind': 0,
      'Solar': 0,
      'Power2Gas': 0,
      'Transport': 0,
      'quickview': false
    },
    view: {
      layers: '11111111111111111110'
    }
  };
  constructor() {
    this.getStateHash();
  }
  on(eventtype) {
    const source = Observable.create((observer) => {
      this.observers[eventtype] = observer;
      if (this.state[eventtype]) {
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
    console.log('setDate', dateobj)
    return this.setObserver('datechange', dateobj);
  }
  getState() {
    console.log('datechage', this.state.datechange.date);
    return this.state;
  }
  setLayers(layers) {
    let str = '';
    layers.forEach(layer => {
      if (layer) {
        str += 0;
      } else {
        str += 1;
      }
    });
    return this.setObserver('view', {layers: str});
  }
  setMutate(mutate) {
    return this.setObserver('mutate', mutate);
  }
  setObserver(name, value) {
    console.log('observers', name, this.observers)
    this.state[name] = value;
    if (this.observers[name]) {
      console.log('next', name, value);
        this.observers[name].next(value);
        this.setStateHash();
    }
  }
  setStateHash() {
    console.log(this.state);
    var url = '';
    for (let s in this.state) {
      url += '&' + s + '='; 
      for(let v in this.state[s]) {
        url += v + ':' + this.state[s][v] + ';';
      }
    }
    console.log(url);
    location.hash = url.substring(1);
  }
  getStateHash() {
    const state = {};
//    let hash = location.hash.substring(1);
    const hash = location.hash.replace(/^#+/, '');
    const parts = hash.split('&');
    if (parts[0]) {
      parts.forEach(part => {
        const kvss = part.split('=');
        state[kvss[0]] = {};
        kvss[1].split(';').forEach(kvs => {
          if (kvs) {
            const kv = kvs.split(':');
            let value: any = kv[1];
            if (value === 'false') {
              value = false;
            } else {
              if (kvss[0] === 'mutate') {
                value = parseInt(value);
              }
            }
            state[kvss[0]][kv[0]] = value;
          }
        });
        //state[kvs[0]] = {};
      });
      this.state = state;
      console.log('state', state);
    }
  }
}
