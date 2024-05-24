import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkTimeSettingsComponent } from './work-time-settings.component';

describe('WorkTimeSettingsComponent', () => {
  let component: WorkTimeSettingsComponent;
  let fixture: ComponentFixture<WorkTimeSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkTimeSettingsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkTimeSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
