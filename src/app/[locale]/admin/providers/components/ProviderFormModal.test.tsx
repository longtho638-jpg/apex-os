import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { expect, describe, it, vi } from 'vitest';
import ProviderFormModal from './ProviderFormModal';

// Mock the props
const mockOnClose = vi.fn();
const mockOnSuccess = vi.fn();

describe('ProviderFormModal', () => {
    it('renders correctly in create mode', () => {
        render(
            <ProviderFormModal
                isOpen={true}
                onClose={mockOnClose}
                onSuccess={mockOnSuccess}
                token="fake-token"
            />
        );

        expect(screen.getByText(/Add New Provider/i)).toBeDefined();
        expect(screen.getByLabelText(/Provider Name/i)).toBeDefined();
        expect(screen.getByLabelText(/Provider Code/i)).toBeDefined();
    });

    it('validates required fields', async () => {
        render(
            <ProviderFormModal
                isOpen={true}
                onClose={mockOnClose}
                onSuccess={mockOnSuccess}
                token="fake-token"
            />
        );

        const submitBtn = screen.getByRole('button', { name: /create provider/i });
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(screen.getByText(/Provider name is required/i)).toBeDefined();
            // Provider code error might be different, let's check exact message from component
            expect(screen.getByText(/Code must be at least 3 characters/i)).toBeDefined();
        });
    });

    it('renders correctly in edit mode', () => {
        const mockProvider = {
            id: '123',
            provider_name: 'Test Provider',
            provider_code: 'test_code',
            asset_class: 'crypto',
            status: 'active',
            partner_uuid: 'uuid',
            referral_link_template: '',
            asset_config: {},
            regulatory_info: {}
        };

        render(
            <ProviderFormModal
                isOpen={true}
                onClose={mockOnClose}
                onSuccess={mockOnSuccess}
                provider={mockProvider}
                token="fake-token"
            />
        );

        expect(screen.getByText(/Edit Provider/i)).toBeDefined();
        expect(screen.getByDisplayValue('Test Provider')).toBeDefined();
        expect(screen.getByDisplayValue('test_code')).toBeDefined();
    });
});
