import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkTimeGroupsListComponent } from './work-time-groups-list.component';

describe('WorkTimeGroupsComponent', () => {
  let component: WorkTimeGroupsListComponent;
  let fixture: ComponentFixture<WorkTimeGroupsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkTimeGroupsListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkTimeGroupsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
