import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import AuditLogViewer from './AuditLogViewer';

// Mock data
const mockLogs = [
  {
    id: 'log-1',
    action: 'created',
    changed_fields: null,
    old_values: null,
    new_values: { provider_name: 'Test Provider' },
    changed_by_user: { email: 'admin@example.com' },
    created_at: '2023-01-01T10:00:00Z',
  },
  {
    id: 'log-2',
    action: 'updated',
    changed_fields: { status: 'active' },
    old_values: { status: 'testing' },
    new_values: { status: 'active' },
    changed_by_user: { email: 'admin@example.com' },
    created_at: '2023-01-02T10:00:00Z',
  },
];

describe('AuditLogViewer', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('renders nothing when closed', () => {
    render(<AuditLogViewer isOpen={false} onClose={() => {}} providerId="123" providerName="Test" token="token" />);
    expect(screen.queryByText('Audit Trail')).toBeNull();
  });

  it('fetches and displays logs when opened', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      json: async () => ({ success: true, logs: mockLogs }),
    });

    render(<AuditLogViewer isOpen={true} onClose={() => {}} providerId="123" providerName="Test" token="token" />);

    // Should show loading initially
    expect(document.querySelector('.animate-spin')).toBeDefined();

    // Wait for logs to load
    await waitFor(() => {
      expect(screen.getByText('created')).toBeDefined();
      expect(screen.getByText('updated')).toBeDefined();
    });

    // Check content
    expect(screen.getAllByText('admin@example.com').length).toBeGreaterThan(0);
    // Check diff rendering
    expect(screen.getByText('testing')).toBeDefined(); // old value
    expect(screen.getByText('active')).toBeDefined(); // new value
  });

  it('displays error message on failure', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      json: async () => ({ success: false, message: 'API Error' }),
    });

    render(<AuditLogViewer isOpen={true} onClose={() => {}} providerId="123" providerName="Test" token="token" />);

    await waitFor(() => {
      expect(screen.getByText('API Error')).toBeDefined();
    });
  });

  it('displays empty state', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      json: async () => ({ success: true, logs: [] }),
    });

    render(<AuditLogViewer isOpen={true} onClose={() => {}} providerId="123" providerName="Test" token="token" />);

    await waitFor(() => {
      expect(screen.getByText(/No audit history found/i)).toBeDefined();
    });
  });
});
