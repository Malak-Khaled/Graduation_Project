import { describe, it, expect } from 'vitest';
import { renderWithProviders } from '../../test/test-utils';
import LoginPage from './LoginPage';

describe('LoginPage', () => {
  it('renders the login form', () => {
    const { container } = renderWithProviders(<LoginPage />, { route: '/login' });
    expect(container.querySelector('form')).toBeTruthy();
  });
});
