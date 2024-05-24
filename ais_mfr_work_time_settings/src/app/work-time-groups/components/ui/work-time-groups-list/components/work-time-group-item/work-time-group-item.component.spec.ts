import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkTimeGroupItemComponent } from './work-time-group-item.component';

describe('WorkTimeGroupItemComponent', () => {
  let component: WorkTimeGroupItemComponent;
  let fixture: ComponentFixture<WorkTimeGroupItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkTimeGroupItemComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkTimeGroupItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
