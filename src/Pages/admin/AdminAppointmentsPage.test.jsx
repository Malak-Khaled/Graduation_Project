import { describe, it, expect } from 'vitest';
import { renderWithProviders, adminAuthState } from '../../test/test-utils';
import AdminAppointmentsPage from './AdminAppointmentsPage';

describe('AdminAppointmentsPage', () => {
  it('renders', () => {
    const { container } = renderWithProviders(<AdminAppointmentsPage />, { preloaded: adminAuthState });
    expect(container.firstChild).toBeTruthy();
  });
});
