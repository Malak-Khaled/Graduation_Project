import { describe, it, expect } from 'vitest';
import { renderWithProviders, doctorAuthState } from '../../test/test-utils';
import DoctorAIAssistantPage from './DoctorAIAssistantPage';

describe('DoctorAIAssistantPage', () => {
  it('renders', () => {
    const { container } = renderWithProviders(<DoctorAIAssistantPage />, { preloaded: doctorAuthState });
    expect(container.firstChild).toBeTruthy();
  });
});
