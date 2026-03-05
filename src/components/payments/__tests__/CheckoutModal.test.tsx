import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CheckoutModal } from '../CheckoutModal';

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

import { toast } from 'sonner';

describe('CheckoutModal', () => {
  // RaaS: Use OPERATOR tier (was PRO), no isOpen prop
  const defaultProps = {
    tier: 'OPERATOR' as const,
    userEmail: 'test@example.com',
    onClose: vi.fn(),
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

  it('displays tier name correctly', () => {
    render(<CheckoutModal {...defaultProps} />);

    // RaaS model: OPERATOR tier, price = $0 (zero-fee model)
    expect(screen.getByRole('heading', { name: /Activate Operator Tier/i })).toBeInTheDocument();

    // RaaS: All tiers are $0 — zero-fee volume-based model
    const zeroElements = screen.getAllByText((content) => content.includes('$0'));
    expect(zeroElements.length).toBeGreaterThan(0);
  });

  it('calls /api/checkout on checkout button click', async () => {
    render(<CheckoutModal {...defaultProps} />);

    const payButton = screen.getByText('Pay with Card');
    fireEvent.click(payButton);

    expect(mockFetch).toHaveBeenCalledWith('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tier: 'OPERATOR',
        gateway: 'polar',
        userEmail: 'test@example.com',
      }),
    });
  });

  it('shows loading state during API call', async () => {
    mockFetch.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => ({ checkoutUrl: 'url' }),
              }),
            100,
          ),
        ),
    );

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
});
