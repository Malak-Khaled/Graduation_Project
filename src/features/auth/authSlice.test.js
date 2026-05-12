import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../utils/authStorage', () => ({
  getStoredUser: () => null,
  getToken: () => null,
  setAuthData: vi.fn(),
  clearAuthData: vi.fn(),
}));

import authReducer, { logout, clearError } from './authSlice';

describe('authSlice', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('logout clears session fields', () => {
    const next = authReducer(
      { user: { name: 'x' }, token: 'tok', role: 'patient', loading: false, error: 'e' },
      logout()
    );
    expect(next.user).toBeNull();
    expect(next.token).toBeNull();
    expect(next.role).toBeNull();
  });

  it('clearError nulls error', () => {
    const next = authReducer(
      { user: null, token: null, role: null, loading: false, error: 'bad' },
      clearError()
    );
    expect(next.error).toBeNull();
  });
});
