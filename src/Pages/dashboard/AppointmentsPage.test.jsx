import { describe, it, expect } from 'vitest';
import { renderWithProviders, patientAuthState } from '../../test/test-utils';
import AppointmentsPage from './AppointmentsPage';

describe('AppointmentsPage', () => {
  it('renders', () => {
    const { container } = renderWithProviders(<AppointmentsPage />, { preloaded: patientAuthState });
    expect(container.firstChild).toBeTruthy();
  });
});
