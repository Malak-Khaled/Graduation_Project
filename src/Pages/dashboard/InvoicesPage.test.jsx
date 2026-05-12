import { describe, it, expect } from 'vitest';
import { renderWithProviders, patientAuthState } from '../../test/test-utils';
import InvoicesPage from './InvoicesPage';

describe('InvoicesPage', () => {
  it('renders', () => {
    const { container } = renderWithProviders(<InvoicesPage />, { preloaded: patientAuthState });
    expect(container.firstChild).toBeTruthy();
  });
});
