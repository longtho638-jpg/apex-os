import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import DeleteConfirmationModal from './DeleteConfirmationModal';

describe('DeleteConfirmationModal', () => {
  const mockOnClose = vi.fn();
  const mockOnConfirm = vi.fn();

  it('renders nothing when closed', () => {
    render(
      <DeleteConfirmationModal
        isOpen={false}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        providerName="Test Provider"
        providerCode="TEST-CODE"
      />,
    );
    expect(screen.queryByText('Delete Provider')).toBeNull();
  });

  it('renders correctly when open', () => {
    render(
      <DeleteConfirmationModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        providerName="Test Provider"
        providerCode="TEST-CODE"
      />,
    );
    expect(screen.getByRole('heading', { name: 'Delete Provider' })).toBeDefined();
    expect(screen.getByText('Test Provider')).toBeDefined();
    expect(screen.getByPlaceholderText('Enter TEST-CODE')).toBeDefined();
  });

  it('disables delete button initially', () => {
    render(
      <DeleteConfirmationModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        providerName="Test Provider"
        providerCode="TEST-CODE"
      />,
    );
    const deleteBtn = screen.getByRole('button', { name: /Delete Provider/i });
    expect((deleteBtn as HTMLButtonElement).disabled).toBe(true);
  });

  it('enables delete button only when code matches', () => {
    render(
      <DeleteConfirmationModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        providerName="Test Provider"
        providerCode="TEST-CODE"
      />,
    );

    const input = screen.getByPlaceholderText('Enter TEST-CODE');
    const deleteBtn = screen.getByRole('button', { name: /Delete Provider/i });

    // Wrong code
    fireEvent.change(input, { target: { value: 'WRONG' } });
    expect((deleteBtn as HTMLButtonElement).disabled).toBe(true);

    // Correct code
    fireEvent.change(input, { target: { value: 'TEST-CODE' } });
    expect((deleteBtn as HTMLButtonElement).disabled).toBe(false);
  });

  it('calls onConfirm when clicked', async () => {
    render(
      <DeleteConfirmationModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        providerName="Test Provider"
        providerCode="TEST-CODE"
      />,
    );

    const input = screen.getByPlaceholderText('Enter TEST-CODE');
    fireEvent.change(input, { target: { value: 'TEST-CODE' } });

    const deleteBtn = screen.getByRole('button', { name: /Delete Provider/i });
    fireEvent.click(deleteBtn);

    expect(mockOnConfirm).toHaveBeenCalled();
  });
});
