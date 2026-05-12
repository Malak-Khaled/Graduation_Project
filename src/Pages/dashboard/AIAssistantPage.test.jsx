import { describe, it, expect } from 'vitest';
import { renderWithProviders, patientAuthState } from '../../test/test-utils';
import AIAssistantPage from './AIAssistantPage';

describe('AIAssistantPage', () => {
  it('renders', () => {
    const { container } = renderWithProviders(<AIAssistantPage />, { preloaded: patientAuthState });
    expect(container.firstChild).toBeTruthy();
  });
});
