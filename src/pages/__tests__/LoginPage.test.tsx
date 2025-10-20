import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginPage } from '../LoginPage';

describe('LoginPage', () => {
  it('validates required fields', async () => {
    render(<LoginPage />);
    const submit = screen.getByRole('button', { name: /sign in/i });
    await userEvent.click(submit);
    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/password must be at least 6/i)).toBeInTheDocument();
  });
});


