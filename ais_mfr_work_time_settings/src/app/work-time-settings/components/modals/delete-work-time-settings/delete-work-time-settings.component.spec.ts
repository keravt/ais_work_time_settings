import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteWorkTimeSettingsComponent } from './delete-work-time-settings.component';

describe('DeleteWorkTimeSettingsComponent', () => {
  let component: DeleteWorkTimeSettingsComponent;
  let fixture: ComponentFixture<DeleteWorkTimeSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeleteWorkTimeSettingsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeleteWorkTimeSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
