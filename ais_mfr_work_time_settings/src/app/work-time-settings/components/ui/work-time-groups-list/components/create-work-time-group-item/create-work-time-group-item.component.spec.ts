import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateWorkTimeGroupItemComponent } from './create-work-time-group-item.component';

describe('CreateWorkTimeGroupItemComponent', () => {
  let component: CreateWorkTimeGroupItemComponent;
  let fixture: ComponentFixture<CreateWorkTimeGroupItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateWorkTimeGroupItemComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateWorkTimeGroupItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
