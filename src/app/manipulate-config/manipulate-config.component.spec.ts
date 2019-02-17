import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManipulateConfigComponent } from './manipulate-config.component';

describe('ManipulateConfigComponent', () => {
  let component: ManipulateConfigComponent;
  let fixture: ComponentFixture<ManipulateConfigComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManipulateConfigComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManipulateConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
