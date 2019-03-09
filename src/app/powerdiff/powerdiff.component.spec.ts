import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PowerdiffComponent } from './powerdiff.component';

describe('PowerdiffComponent', () => {
  let component: PowerdiffComponent;
  let fixture: ComponentFixture<PowerdiffComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PowerdiffComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PowerdiffComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
