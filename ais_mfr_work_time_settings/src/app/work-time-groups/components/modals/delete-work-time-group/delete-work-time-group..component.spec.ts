import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteWorkTimeGroupComponent } from './delete-work-time-group..component';

describe('DeleteWorkTimeSettingsComponent', () => {
  let component: DeleteWorkTimeGroupComponent;
  let fixture: ComponentFixture<DeleteWorkTimeGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeleteWorkTimeGroupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeleteWorkTimeGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
