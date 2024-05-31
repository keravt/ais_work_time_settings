import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WtsOptionsComponent } from './wts-options.component';

describe('WtsOptionsComponent', () => {
  let component: WtsOptionsComponent;
  let fixture: ComponentFixture<WtsOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WtsOptionsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WtsOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
