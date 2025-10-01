import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '../Input';

describe('Input Component', () => {
  it('renders input with label', () => {
    render(<Input label="Email" value="" onChange={() => {}} />);
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('calls onChange when typing', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<Input label="Name" value="" onChange={handleChange} />);

    const input = screen.getByLabelText('Name');
    await user.type(input, 'test');

    expect(handleChange).toHaveBeenCalled();
  });

  it('displays error message', () => {
    render(<Input label="Email" value="" onChange={() => {}} error="Invalid email" />);
    expect(screen.getByText('Invalid email')).toBeInTheDocument();
  });

  it('renders as password type', () => {
    render(<Input label="Password" type="password" value="" onChange={() => {}} />);
    const input = screen.getByLabelText('Password');
    expect(input).toHaveAttribute('type', 'password');
  });

  it('respects disabled state', () => {
    render(<Input label="Name" value="" onChange={() => {}} disabled />);
    const input = screen.getByLabelText('Name');
    expect(input).toBeDisabled();
  });

  it('shows placeholder text', () => {
    render(<Input label="Email" placeholder="Enter email" value="" onChange={() => {}} />);
    expect(screen.getByPlaceholderText('Enter email')).toBeInTheDocument();
  });
});
