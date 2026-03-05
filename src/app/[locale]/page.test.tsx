import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import type React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Homepage from './page';

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'hero.badge': 'RaaS AGI Trading Platform',
      'hero.title_line1': 'Zero-Fee Exchange',
      'hero.title_line2': 'Agentic Trading OS',
      'hero.description':
        "The world's first zero-fee, AI-native trading platform. Revenue from spread, not subscriptions.",
      'hero.cta_primary': 'Launch Trading Agents',
      'hero.cta_secondary': 'See How It Works',
      'raas.badge': 'Revenue-as-a-Service',
      'raas.title': 'Zero Subscription Fees. Forever.',
      'raas.subtitle': 'Your tier is determined by trading volume, not your wallet.',
      'onboarding.badge': 'Agentic Onboarding',
      'onboarding.title': 'AI Deploys Your Trading Agents',
      'onboarding.subtitle': '30-second setup. No forms. Just trade.',
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
  Button3D: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <button onClick={onClick} data-testid="button-3d">
      {children}
    </button>
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

vi.mock('@/components/onboarding/agentic-onboarding-wizard', () => ({
  AgenticOnboardingWizard: () => <div data-testid="agentic-onboarding" />,
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
    div: ({ children, className }: { children: React.ReactNode; className: string }) => (
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

    expect(screen.getByText('RaaS AGI Trading Platform')).toBeInTheDocument();
    expect(screen.getByText('Zero-Fee Exchange')).toBeInTheDocument();
    expect(screen.getByText('Agentic Trading OS')).toBeInTheDocument();
    expect(screen.getByText(/zero-fee, AI-native trading platform/)).toBeInTheDocument();
    expect(screen.getByText('Launch Trading Agents')).toBeInTheDocument();
    expect(screen.getByText('See How It Works')).toBeInTheDocument();

    // Wait for the effect to settle to avoid act warnings
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/marketplace/strategies');
    });
  });
});
