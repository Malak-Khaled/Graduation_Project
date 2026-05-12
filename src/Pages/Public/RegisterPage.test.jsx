import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../test/test-utils';
import RegisterPage from './RegisterPage';

describe('RegisterPage', () => {
  it('renders the patient registration title', () => {
    renderWithProviders(<RegisterPage />, { route: '/register' });
    expect(screen.getByText('إنشاء حساب مريض')).toBeInTheDocument();
  });
});
