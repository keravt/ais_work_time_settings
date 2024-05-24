import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateWorkTimeSettingItemComponent } from './create-work-time-setting-item.component';

describe('CreateWorkTimeSettingItemComponent', () => {
  let component: CreateWorkTimeSettingItemComponent;
  let fixture: ComponentFixture<CreateWorkTimeSettingItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateWorkTimeSettingItemComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateWorkTimeSettingItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
