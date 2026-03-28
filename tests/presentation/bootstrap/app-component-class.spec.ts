import { describe, expect, it, vi } from 'vitest';
import { App } from '../../../src/presentation/web/src/app/app';

describe('App class signal', () => {
  it('keeps default title value', () => {
    const app = new App();

    expect((app as any).title()).toBe('meu-app');
  });
});
