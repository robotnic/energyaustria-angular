import { Component, OnInit } from '@angular/core';
import { Router,  NavigationEnd } from '@angular/router';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent implements OnInit {
  url;
  constructor(titleService: Title, router: Router ) {
    router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.url = router.routerState.snapshot.url.split('#')[0];
        console.log('ROUTER2', this.url);
        const title = this.getTitle(router.routerState, router.routerState.root).join('-');
        titleService.setTitle(title);
      }
    });
  }
  ngOnInit() {
    window.scrollTo(0, 1);
  }
  hash() {
    return location.hash.replace(/^#+/, '');
  }

  // collect that title data properties from all child routes
  // there might be a better way but this worked for me
  getTitle(state, parent) {
    const data = [];
    if(parent && parent.snapshot.data && parent.snapshot.data.title) {
      data.push(parent.snapshot.data.title);
    }

    if(state && parent) {
      data.push(... this.getTitle(state, state.firstChild(parent)));
    }
    return data;
  }
}

