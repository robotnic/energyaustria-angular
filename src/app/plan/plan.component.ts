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
  width = 6;
  height = 3;
  blocks = [
    [1,2,3],
    [4,5,6],
    [7,8,9],
    [10,11,12],
    [13,14,15],
    [16,17,18],
  ];
  meta = {
    panel: {
      name: 'Sanyo Extrem',
      power: '310'
    },
    price: '300',
    totalPanels: 0
  };
  cart = [];
  geometry = {
    type: 'FeatureCollection',
    features: [ ]
  };
  selectRect;
  constructor() { }

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
        this.meta.totalPanels++;
        this.geometry.features.push(feature);
      }
    }
    }
    }
    this.meta.totalPanels *= this.blocks.length;
  }

}
