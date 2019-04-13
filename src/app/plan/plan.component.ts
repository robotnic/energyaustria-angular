import { Component, OnInit } from '@angular/core';
import { CdkFooterRowDefBase } from '@angular/cdk/table';

@Component({
  selector: 'app-plan',
  templateUrl: './plan.component.html',
  styleUrls: ['./plan.component.less']
})
export class PlanComponent implements OnInit {
  rows = 10;
  cols = 3;
  width = 5;
  height = 4;
  blocks = [
    [1,2,3],
    [4,5,6],
    [7,8,9],
    [10,11,12],

  ];
  cart = [];
  geometry = {
    type: 'FeatureCollection',
    features: [ ]
  };
  selectRect;
  constructor() { }
  down(evt) {
    const svg = document.getElementById('svg');
    console.log(svg);
    this.selectRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    this.selectRect.setAttribute('x', evt.x);
    this.selectRect.setAttribute('y', evt.y);
    this.selectRect.setAttribute('stroke', 'black');
    this.selectRect.setAttribute('fill', 'none');
    svg.appendChild(this.selectRect);
    console.log(this.selectRect);
  }
  move(evt) {
    if (this.selectRect) {
      const x = this.selectRect.getAttribute('x');
      const y = this.selectRect.getAttribute('y');
      const width = Math.abs(evt.x - x)
      const height = Math.abs(evt.y - y)
      this.selectRect.setAttribute('width', width);
      this.selectRect.setAttribute('height', height);
      console.log(x, y, width, height);
      console.log('move', this.selectRect);
    }
  }
  up() {
    console.log('up', this.selectRect);
  }


  click(evt, properties) {
    console.log(evt, properties);
    evt.target.style.fill = 'black';
    if (this.cart.indexOf(properties.number) !== -1) {
      evt.target.style.fill = 'white';
      this.cart = this.cart.filter(item => {
        return item !== properties.number;
      });
    } else {
      this.cart.push(properties.number);
    }
  };
  ngOnInit() {
    console.log('plan');
    let n = 0;
    for (let w = 0; w < this.width; w++) {
    for (let h = 0; h < this.height; h++) {
    for (let x = 0; x < this.rows; x++) {
      for (let y = 0; y < this.cols; y++) {
        const feature = {
          x: x * 20 + w * (this.rows * 20 + 10),
          y: y * 12 + h * (this.cols * 12 + 20),
          properties: {
            number: n++
          }
        };
        this.geometry.features.push(feature);
      }
    }
    }
    }

  }

}
