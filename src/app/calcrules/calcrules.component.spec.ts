import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CalcrulesComponent } from './calcrules.component';

describe('CalcrulesComponent', () => {
  let component: CalcrulesComponent;
  let fixture: ComponentFixture<CalcrulesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CalcrulesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CalcrulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
