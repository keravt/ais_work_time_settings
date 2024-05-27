import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkTimeGroupPreviewComponent } from './work-time-group-preview.component';

describe('WorkTimeGroupPreviewComponent', () => {
  let component: WorkTimeGroupPreviewComponent;
  let fixture: ComponentFixture<WorkTimeGroupPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkTimeGroupPreviewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkTimeGroupPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
