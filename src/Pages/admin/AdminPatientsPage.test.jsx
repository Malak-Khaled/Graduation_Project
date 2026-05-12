import { describe, it, expect } from 'vitest';
import { renderWithProviders, adminAuthState } from '../../test/test-utils';
import AdminPatientsPage from './AdminPatientsPage';

describe('AdminPatientsPage', () => {
  it('renders', () => {
    const { container } = renderWithProviders(<AdminPatientsPage />, { preloaded: adminAuthState });
    expect(container.firstChild).toBeTruthy();
  });
});
