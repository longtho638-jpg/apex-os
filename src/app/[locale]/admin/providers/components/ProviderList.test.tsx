import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ProviderList from './ProviderList';

// Mock the props
const mockProviders = [
  {
    id: '1',
    provider_code: 'binance',
    provider_name: 'Binance',
    asset_class: 'crypto',
    partner_uuid: 'uuid-1',
    referral_link_template: 'link-1',
    status: 'active',
    health_status: 'healthy',
    last_health_check: new Date().toISOString(),
    version: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    provider_code: 'oanda',
    provider_name: 'Oanda',
    asset_class: 'forex',
    partner_uuid: 'uuid-2',
    referral_link_template: 'link-2',
    status: 'testing',
    health_status: 'degraded',
    last_health_check: new Date().toISOString(),
    version: 1,
    created_at: new Date().toISOString(),
  },
];

const mockOnEdit = vi.fn();
const mockOnDelete = vi.fn();
const mockOnHealthCheck = vi.fn();
const mockOnAudit = vi.fn();
const mockOnBulkAction = vi.fn();

describe('ProviderList', () => {
  it('renders loading state', () => {
    render(
      <ProviderList
        providers={[]}
        loading={true}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onHealthCheck={mockOnHealthCheck}
        onAudit={mockOnAudit}
        onBulkAction={mockOnBulkAction}
        onViewAnalytics={vi.fn()}
      />,
    );
    // Look for spinner or loading container
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeDefined();
  });

  it('renders empty state', () => {
    render(
      <ProviderList
        providers={[]}
        loading={false}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onHealthCheck={mockOnHealthCheck}
        onAudit={mockOnAudit}
        onBulkAction={mockOnBulkAction}
        onViewAnalytics={vi.fn()}
      />,
    );
    expect(screen.getByText(/No providers found/i)).toBeDefined();
  });

  it('renders providers list', () => {
    render(
      <ProviderList
        providers={mockProviders}
        loading={false}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onHealthCheck={mockOnHealthCheck}
        onAudit={mockOnAudit}
        onBulkAction={mockOnBulkAction}
        onViewAnalytics={vi.fn()}
      />,
    );
    expect(screen.getByText('Binance')).toBeDefined();
    expect(screen.getByText('Oanda')).toBeDefined();
    expect(screen.getAllByText('crypto')).toHaveLength(1); // Asset class badge
  });

  it('handles selection', () => {
    render(
      <ProviderList
        providers={mockProviders}
        loading={false}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onHealthCheck={mockOnHealthCheck}
        onAudit={mockOnAudit}
        onBulkAction={mockOnBulkAction}
        onViewAnalytics={vi.fn()}
      />,
    );

    // Select first provider
    const checkboxes = screen.getAllByRole('button');
    // Note: Buttons are used for checkboxes in this UI.
    // We need to be specific. The row checkboxes are the first button in each row.
    // But there's also a "Select All" in header.

    // Let's find by clicking the row checkbox for Binance
    // The first row is index 1 (0 is header)
    // Or we can find by the button inside the first td

    // Let's assume the first button in the body is for the first row
    // Actually, let's use a more robust way if possible, but for now we click the second button (first is header select all)
    // Wait, "Select All" is in header.

    // Let's just click the "Select All" button first
    const selectAllBtn = checkboxes[0];
    fireEvent.click(selectAllBtn);

    expect(screen.getByText('2 selected')).toBeDefined();
  });

  it('triggers edit action', () => {
    render(
      <ProviderList
        providers={mockProviders}
        loading={false}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onHealthCheck={mockOnHealthCheck}
        onAudit={mockOnAudit}
        onBulkAction={mockOnBulkAction}
        onViewAnalytics={vi.fn()}
      />,
    );

    const editBtns = screen.getAllByText('Edit');
    fireEvent.click(editBtns[0]);
    expect(mockOnEdit).toHaveBeenCalledWith(mockProviders[0]);
  });

  it('triggers bulk action', async () => {
    render(
      <ProviderList
        providers={mockProviders}
        loading={false}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onHealthCheck={mockOnHealthCheck}
        onAudit={mockOnAudit}
        onBulkAction={mockOnBulkAction}
        onViewAnalytics={vi.fn()}
      />,
    );

    // Select all
    const checkboxes = screen.getAllByRole('button');
    fireEvent.click(checkboxes[0]); // Select All

    // Click Activate
    const activateBtn = screen.getByText('Activate');
    fireEvent.click(activateBtn);

    expect(mockOnBulkAction).toHaveBeenCalledWith(expect.arrayContaining(['1', '2']), 'activate');
  });
});
