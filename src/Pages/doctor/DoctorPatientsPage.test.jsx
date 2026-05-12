import { describe, it, expect } from 'vitest';
import { renderWithProviders, doctorAuthState } from '../../test/test-utils';
import DoctorPatientsPage from './DoctorPatientsPage';

describe('DoctorPatientsPage', () => {
  it('renders', () => {
    const { container } = renderWithProviders(<DoctorPatientsPage />, { preloaded: doctorAuthState });
    expect(container.firstChild).toBeTruthy();
  });
});
