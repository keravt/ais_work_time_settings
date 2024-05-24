import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SideBarLockedComponent } from './side-bar-locked.component';

describe('SideBarLockedComponent', () => {
  let component: SideBarLockedComponent;
  let fixture: ComponentFixture<SideBarLockedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SideBarLockedComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SideBarLockedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
