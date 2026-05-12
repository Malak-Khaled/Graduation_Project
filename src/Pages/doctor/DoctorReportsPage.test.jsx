import { describe, it, expect } from 'vitest';
import { renderWithProviders, doctorAuthState } from '../../test/test-utils';
import DoctorReportsPage from './DoctorReportsPage';

describe('DoctorReportsPage', () => {
  it('renders', () => {
    const { container } = renderWithProviders(<DoctorReportsPage />, { preloaded: doctorAuthState });
    expect(container.firstChild).toBeTruthy();
  });
});
