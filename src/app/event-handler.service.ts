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
  defaultState: any = {
    'datechange': {
      'date': _moment().subtract(1, 'd').format('YYYYMMDD'),
      'timetype': 'day',
      'reload': false,
      'country': 'Austria'
    },
    'mutate': {
      'Wind Onshore': 0,
      'Wind Offshore': 0,
      'Solar': 0,
      'Power2Gas': 0,
      'Transport': 0,
      'quickview': false
    },
    'view': {
      'layers': '111111111111111111110'
    }
  };
  state = JSON.parse(JSON.stringify(this.defaultState));

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
    return this.setObserver('datechange', dateobj);
  }
  getState() {
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
    this.state[name] = value;
    if (this.observers[name]) {
      this.observers[name].next(value);
      this.setStateHash();
    }
  }

  setStateHash() {
    let url = '';
    // tslint:disable-next-line:forin
    for (let s in this.state) {
      let hit = false;
      let suburl = '&' + s + '=';
      for(let v in this.state[s]) {
        if (this.state[s][v] !== this.defaultState[s][v] && this.state[s][v]) {
          suburl += v + ':' + this.state[s][v] + ';';
          hit = true;
        }
      }
      if (hit) {
        url += suburl;
      }
    }
    location.hash = url.substring(1);
  }
  getStateHash() {
    this.state = JSON.parse(JSON.stringify(this.defaultState));
//    let hash = location.hash.substring(1);
    const hash = location.hash.replace(/^#+/, '');
    const parts = hash.split('&');
    if (parts[0]) {
      parts.forEach(part => {
        const kvss = part.split('=');
        //this.state[kvss[0]] = {};
        kvss[1].split(';').forEach(kvs => {
          if (kvs) {
            const kv = kvs.split(':');
            let value: any = kv[1];
            value = decodeURIComponent(value);
            if (value === 'false') {
              value = false;
            } else {
              if (kvss[0] === 'mutate') {
                value = parseInt(value, 10) || 0;
                console.log(kvs, value);
              }
            }
            this.state[kvss[0]][decodeURIComponent(kv[0])] = value;
          }
        });
        //state[kvs[0]] = {};
      });
//      this.state = state;
    }
    //this.state = Object.assign(this.defaultState, this.state);
  }
}
