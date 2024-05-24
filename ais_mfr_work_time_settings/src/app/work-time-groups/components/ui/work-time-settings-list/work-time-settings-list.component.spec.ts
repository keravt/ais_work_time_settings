import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkTimeSettingsListComponent } from './work-time-settings-list.component';

describe('WorkTimeSettingsListComponent', () => {
  let component: WorkTimeSettingsListComponent;
  let fixture: ComponentFixture<WorkTimeSettingsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkTimeSettingsListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkTimeSettingsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
