import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MutateuiComponent } from './mutateui.component';

describe('MutateuiComponent', () => {
  let component: MutateuiComponent;
  let fixture: ComponentFixture<MutateuiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MutateuiComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MutateuiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
