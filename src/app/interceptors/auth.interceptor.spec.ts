import { TestBed } from '@angular/core/testing';

import { authInterceptor } from './auth.interceptor';

describe('AuthInterceptor', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const interceptor = authInterceptor;
    expect(interceptor).toBeTruthy();
  });
});
