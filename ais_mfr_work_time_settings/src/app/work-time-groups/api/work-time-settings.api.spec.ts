import { TestBed } from '@angular/core/testing';
import { WorkTimeSettingsApi } from './work-time-settings.api';



describe('WorkTimeSettingsService', () => {
  let service: WorkTimeSettingsApi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorkTimeSettingsApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
