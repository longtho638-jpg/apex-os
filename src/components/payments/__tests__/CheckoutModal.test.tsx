import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { CheckoutModal } from '../CheckoutModal';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { toast } from 'sonner';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock window.alert
global.alert = vi.fn();

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}));

describe('CheckoutModal', () => {
  const defaultProps = {
    tier: 'PRO' as const,
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

    expect(screen.getByRole('heading', { name: /Subscribe to Pro/i })).toBeInTheDocument();

    // Check for monthly price "$29"
    // We look for elements containing "$29" that don't have "/" (to exclude the total line)
    const priceElements = screen.getAllByText((content, element) => {
      return content.includes('$29') && element?.tagName.toLowerCase() === 'span';
    });
    expect(priceElements.length).toBeGreaterThan(0);

    // Check for total line "$29.00/mo"
    expect(screen.getByText((content) => content.includes('$29.00') && content.includes('/mo'))).toBeInTheDocument();
  });

  it('shows crypto discount when crypto selected', () => {
    render(<CheckoutModal {...defaultProps} />);

    // Click Crypto button
    const cryptoButton = screen.getByText('Crypto');
    fireEvent.click(cryptoButton);

    // Check for discount label
    expect(screen.getByText(/Crypto Discount/i)).toBeInTheDocument();

    // Pro price 29, 10% discount -> 2.90 discount -> 26.10 final
    // Match partial text for flexibility
    expect(screen.getByText((content) => content.includes('2.90'))).toBeInTheDocument();
    expect(screen.getByText((content) => content.includes('26.10'))).toBeInTheDocument();
  });

  it('calls /api/checkout on checkout button click', async () => {
    render(<CheckoutModal {...defaultProps} />);

    const payButton = screen.getByText('Pay with Card');
    fireEvent.click(payButton);

    expect(mockFetch).toHaveBeenCalledWith('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tier: 'PRO',
        gateway: 'polar',
        userEmail: 'test@example.com',
        billingPeriod: 'monthly',
      }),
    });
  });

  it('shows loading state during API call', async () => {
    // Mock slow fetch
    mockFetch.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: async () => ({ checkoutUrl: 'url' })
    }), 100)));

    render(<CheckoutModal {...defaultProps} />);

    const payButton = screen.getByText('Pay with Card');
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

    const payButton = screen.getByText('Pay with Card');
    fireEvent.click(payButton);

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
      render(<CheckoutModal {...defaultProps} isOpen={false} />);
      expect(screen.queryByText('Subscribe to Pro')).not.toBeInTheDocument();
  });
});
