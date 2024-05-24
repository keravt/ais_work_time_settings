import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPersonToWorkTimeSettingsComponent } from './add-person-to-work-time-settings.component';

describe('AddPersonToWorkTimeSettingsComponent', () => {
  let component: AddPersonToWorkTimeSettingsComponent;
  let fixture: ComponentFixture<AddPersonToWorkTimeSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddPersonToWorkTimeSettingsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddPersonToWorkTimeSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
