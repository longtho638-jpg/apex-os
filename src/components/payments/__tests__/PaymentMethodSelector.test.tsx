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
    
    expect(screen.getByText('SAVE 15%')).toBeInTheDocument();
  });

  it('calls onChange when option clicked', () => {
    const handleChange = vi.fn();
    render(<PaymentMethodSelector value="polar" onChange={handleChange} />);
    
    fireEvent.click(screen.getByText('Crypto'));
    expect(handleChange).toHaveBeenCalledWith('binance_pay');
    
    fireEvent.click(screen.getByText('Card / PayPal'));
    expect(handleChange).toHaveBeenCalledWith('polar');
  });

  it('highlights selected option', () => {
    const { rerender } = render(<PaymentMethodSelector value="polar" onChange={() => {}} />);
    
    // Polar selected (blue border)
    // We check for the parent button element. 
    // The button contains "Card / PayPal".
    const polarButton = screen.getByRole('radio', { name: /card \/ paypal/i });
    expect(polarButton).toHaveClass('border-blue-600');
    expect(polarButton).toHaveAttribute('aria-checked', 'true');

    const cryptoButton = screen.getByRole('radio', { name: /crypto/i });
    expect(cryptoButton).not.toHaveClass('border-amber-500'); // Crypto active class
    expect(cryptoButton).toHaveAttribute('aria-checked', 'false');

    // Rerender with crypto selected
    rerender(<PaymentMethodSelector value="binance_pay" onChange={() => {}} />);
    
    expect(screen.getByRole('radio', { name: /crypto/i })).toHaveClass('border-amber-500');
    expect(screen.getByRole('radio', { name: /crypto/i })).toHaveAttribute('aria-checked', 'true');
  });
});
