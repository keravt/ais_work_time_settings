import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkTimeInfoComponent } from './work-time-info.component';

describe('WorkTimeInfoComponent', () => {
  let component: WorkTimeInfoComponent;
  let fixture: ComponentFixture<WorkTimeInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkTimeInfoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkTimeInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
