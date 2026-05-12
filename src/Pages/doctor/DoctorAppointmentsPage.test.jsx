import { describe, it, expect } from 'vitest';
import { renderWithProviders, doctorAuthState } from '../../test/test-utils';
import DoctorAppointmentsPage from './DoctorAppointmentsPage';

describe('DoctorAppointmentsPage', () => {
  it('renders', () => {
    const { container } = renderWithProviders(<DoctorAppointmentsPage />, { preloaded: doctorAuthState });
    expect(container.firstChild).toBeTruthy();
  });
});
