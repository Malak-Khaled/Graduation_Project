import { describe, it, expect } from 'vitest';
import { renderWithProviders, doctorAuthState } from '../../test/test-utils';
import DoctorProfilePage from './DoctorProfilePage';

describe('DoctorProfilePage', () => {
  it('renders', () => {
    const { container } = renderWithProviders(<DoctorProfilePage />, { preloaded: doctorAuthState });
    expect(container.firstChild).toBeTruthy();
  });
});
