import { describe, it, expect } from 'vitest';
import { renderWithProviders, adminAuthState } from '../../test/test-utils';
import AdminDoctorsPage from './AdminDoctorsPage';

describe('AdminDoctorsPage', () => {
  it('renders', () => {
    const { container } = renderWithProviders(<AdminDoctorsPage />, { preloaded: adminAuthState });
    expect(container.firstChild).toBeTruthy();
  });
});
