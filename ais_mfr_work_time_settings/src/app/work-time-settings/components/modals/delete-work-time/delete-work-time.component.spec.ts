import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteWorkTimeComponent } from './delete-work-time.component';

describe('DeleteWorkTimeComponent', () => {
  let component: DeleteWorkTimeComponent;
  let fixture: ComponentFixture<DeleteWorkTimeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeleteWorkTimeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeleteWorkTimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
