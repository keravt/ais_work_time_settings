import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaveWorkTimeComponent } from './save-work-time.component';

describe('SaveWorkTimeComponent', () => {
  let component: SaveWorkTimeComponent;
  let fixture: ComponentFixture<SaveWorkTimeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SaveWorkTimeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SaveWorkTimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
