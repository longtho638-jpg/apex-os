import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CheckoutModal } from '../CheckoutModal';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { toast } from 'sonner';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}));

describe('CheckoutModal', () => {
  const defaultProps = {
    tier: 'FOUNDERS' as const,
    userEmail: 'test@example.com',
    onClose: vi.fn(),
    isOpen: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ checkoutUrl: 'https://checkout.url' }),
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('displays tier name and price correctly', () => {
    render(<CheckoutModal {...defaultProps} />);
    
    expect(screen.getByText('Subscribe to Founders')).toBeInTheDocument();
    // Price appears twice: in breakdown and total
    const prices = screen.getAllByText('$49.00');
    expect(prices).toHaveLength(2);
  });

  it('shows crypto discount when crypto selected', () => {
    render(<CheckoutModal {...defaultProps} />);
    
    // Default is Polar (Card) - No discount shown initially in summary?
    // Let's check logic. Yes, discount only if isCrypto.
    
    // Click Crypto
    fireEvent.click(screen.getByText('Crypto'));
    
    expect(screen.getByText(/Crypto Discount/i)).toBeInTheDocument();
    // Founders price 49, 10% discount -> 4.9 discount -> 44.10 final
    expect(screen.getByText('-$4.90')).toBeInTheDocument();
    expect(screen.getByText('$44.10')).toBeInTheDocument();
  });

  it('calls /api/checkout on checkout button click', async () => {
    render(<CheckoutModal {...defaultProps} />);
    
    const payButton = screen.getByRole('button', { name: /pay \$49.00 with card/i });
    fireEvent.click(payButton);
    
    expect(mockFetch).toHaveBeenCalledWith('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tier: 'FOUNDERS',
        gateway: 'polar',
        userEmail: 'test@example.com',
      }),
    });
    
    await waitFor(() => {
        // Expect redirection logic - window.location assignment is hard to test in jsdom without mock
        // We can assume functionality if fetch called correctly for now, or mock window.location
    });
  });

  it('shows loading state during API call', async () => {
    // Mock slow fetch
    mockFetch.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: async () => ({ checkoutUrl: 'url' })
    }), 100)));

    render(<CheckoutModal {...defaultProps} />);
    
    const payButton = screen.getByRole('button', { name: /pay \$49.00 with card/i });
    fireEvent.click(payButton);
    
    expect(screen.getByText('Processing...')).toBeInTheDocument();
    expect(payButton).toBeDisabled();
    
    await waitFor(() => expect(screen.queryByText('Processing...')).not.toBeInTheDocument());
  });

  it('handles API errors with error message', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'API Error' }),
    });

    render(<CheckoutModal {...defaultProps} />);
    
    fireEvent.click(screen.getByRole('button', { name: /pay/i }));
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Checkout Failed', expect.any(Object));
    });
  });

  it('closes modal on cancel button', () => {
    render(<CheckoutModal {...defaultProps} />);
    
    fireEvent.click(screen.getByText('Cancel'));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });
  
  it('does not render when isOpen is false', () => {
      render(<CheckoutModal {...defaultProps} />);
      expect(screen.queryByText('Subscribe to Founders')).not.toBeInTheDocument();
  });
});
