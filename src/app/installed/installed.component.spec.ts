import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InstalledComponent } from './installed.component';

describe('InstalledComponent', () => {
  let component: InstalledComponent;
  let fixture: ComponentFixture<InstalledComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InstalledComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InstalledComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
