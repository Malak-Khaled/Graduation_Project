import { describe, it, expect } from 'vitest';
import { renderWithProviders, adminAuthState } from '../../test/test-utils';
import AdminInvoicesPage from './AdminInvoicesPage';

describe('AdminInvoicesPage', () => {
  it('renders', () => {
    const { container } = renderWithProviders(<AdminInvoicesPage />, { preloaded: adminAuthState });
    expect(container.firstChild).toBeTruthy();
  });
});
