import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkTimeSettingItemComponent } from './work-time-setting-item.component';

describe('WorkTimeSettingItemComponent', () => {
  let component: WorkTimeSettingItemComponent;
  let fixture: ComponentFixture<WorkTimeSettingItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkTimeSettingItemComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkTimeSettingItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
