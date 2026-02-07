import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Homepage from './page';
import React from 'react';

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'hero.badge': 'Institutional Grade AI Trading Platform',
      'hero.title_line1': 'Agentic Trade Intelligence',
      'hero.title_line2': 'Built for Professionals',
      'hero.description': 'The world\'s first self-improving trading OS.',
      'hero.cta_primary': 'Start Free Trial',
      'hero.cta_secondary': 'Watch Demo'
    };
    return translations[key] || key;
  },
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock components that might cause issues or aren't relevant for this test
vi.mock('@/components/marketing/Button3D', () => ({
  Button3D: ({ children, onClick }: { children: React.ReactNode, onClick?: () => void }) => (
    <button onClick={onClick} data-testid="button-3d">{children}</button>
  ),
}));

vi.mock('@/components/marketing/AnimatedNumber', () => ({
  AnimatedNumber: ({ value }: { value: number }) => <span>{value}</span>,
}));

vi.mock('@/components/marketing/ParticleBackground', () => ({
  ParticleBackground: () => <div data-testid="particle-bg" />,
}));

vi.mock('@/components/marketing/GradientText', () => ({
  GradientText: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));

vi.mock('@/components/marketing/SiteHeader', () => ({
  SiteHeader: () => <div data-testid="site-header" />,
}));

vi.mock('@/components/marketing/SiteFooter', () => ({
  SiteFooter: () => <div data-testid="site-footer" />,
}));

vi.mock('@/components/dashboard/SmartSwitchWizard', () => ({
  default: () => <div data-testid="smart-switch-wizard" />,
}));

vi.mock('@/components/marketing/LiveStats', () => ({
  LiveStats: () => <div data-testid="live-stats" />,
}));

vi.mock('@/components/ui/mouse-glow', () => ({
  MouseGlow: () => <div data-testid="mouse-glow" />,
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className }: { children: React.ReactNode, className: string }) => (
      <div className={className}>{children}</div>
    ),
  },
}));

describe('Homepage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      json: async () => ({ success: true, data: [] }),
    });
  });

  it('renders hero section with translated text', async () => {
    render(<Homepage />);

    expect(screen.getByText('Institutional Grade AI Trading Platform')).toBeInTheDocument();
    expect(screen.getByText('Agentic Trade Intelligence')).toBeInTheDocument();
    expect(screen.getByText('Built for Professionals')).toBeInTheDocument();
    expect(screen.getByText(/The world's first self-improving trading OS/)).toBeInTheDocument();
    expect(screen.getByText('Start Free Trial')).toBeInTheDocument();
    expect(screen.getByText('Watch Demo')).toBeInTheDocument();

    // Wait for the effect to settle to avoid act warnings
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/marketplace/strategies');
    });
  });
});
