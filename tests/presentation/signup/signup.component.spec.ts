import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SignupComponent } from '../../../src/presentation/web/src/app/pages/signup/signup.component';

describe('SignupComponent', () => {
  let component: SignupComponent;

  const routerMock = {
    navigate: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    component = new SignupComponent(routerMock as unknown as Router);
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('navigates to login on register()', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);

    component.name = 'Alice';
    component.email = 'alice@example.com';
    component.password = 'secret';

    component.register();

    expect(logSpy).toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
  });
});
