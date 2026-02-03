import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { PaymentMethodSelector } from '../PaymentMethodSelector';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';

describe('PaymentMethodSelector', () => {
  it('renders both payment options', () => {
    render(<PaymentMethodSelector value="polar" onChange={() => {}} />);
    
    expect(screen.getByText('Card / PayPal')).toBeInTheDocument();
    expect(screen.getByText('Crypto')).toBeInTheDocument();
  });

  it('shows discount badge on crypto option', () => {
    render(<PaymentMethodSelector value="polar" onChange={() => {}} />);
    
    expect(screen.getByText('Discount')).toBeInTheDocument();
  });

  it('calls onChange when option clicked', () => {
    const handleChange = vi.fn();
    render(<PaymentMethodSelector value="polar" onChange={handleChange} />);
    
    fireEvent.click(screen.getByText('Crypto'));
    expect(handleChange).toHaveBeenCalledWith('nowpayments');
    
    fireEvent.click(screen.getByText('Card / PayPal'));
    expect(handleChange).toHaveBeenCalledWith('polar');
  });

  it('highlights selected option', () => {
    const { rerender } = render(<PaymentMethodSelector value="polar" onChange={() => {}} />);
    
    // Polar selected (blue border)
    // We check for the parent button element.
    // The button contains "Card / PayPal".
    const polarButton = screen.getByText('Card / PayPal').closest('button');
    expect(polarButton).toHaveClass('border-blue-500');

    // Check inactive crypto button
    const cryptoButton = screen.getByText('Crypto').closest('button');
    expect(cryptoButton).not.toHaveClass('border-blue-500');

    // Rerender with crypto selected
    rerender(<PaymentMethodSelector value="nowpayments" onChange={() => {}} />);

    expect(screen.getByText('Crypto').closest('button')).toHaveClass('border-blue-500');
  });
});
