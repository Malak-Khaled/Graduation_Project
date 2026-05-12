import { describe, it, expect, beforeEach } from 'vitest';
import { setAuthData, clearAuthData, getToken, getStoredUser } from './authStorage';

describe('authStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('stores and reads token and user', () => {
    setAuthData({ token: 't1', user: { name: 'A', role: 'patient' } });
    expect(getToken()).toBe('t1');
    expect(getStoredUser().role).toBe('patient');
  });

  it('clearAuthData removes keys', () => {
    setAuthData({ token: 'x', user: { name: 'B' } });
    clearAuthData();
    expect(getToken()).toBeNull();
    expect(getStoredUser()).toBeNull();
  });
});
