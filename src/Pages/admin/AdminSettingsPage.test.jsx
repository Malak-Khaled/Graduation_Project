import { describe, it, expect } from 'vitest';
import { renderWithProviders, adminAuthState } from '../../test/test-utils';
import AdminSettingsPage from './AdminSettingsPage';

describe('AdminSettingsPage', () => {
  it('renders', () => {
    const { container } = renderWithProviders(<AdminSettingsPage />, { preloaded: adminAuthState });
    expect(container.firstChild).toBeTruthy();
  });
});
