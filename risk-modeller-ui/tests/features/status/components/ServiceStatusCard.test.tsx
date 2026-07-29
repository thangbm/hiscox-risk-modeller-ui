import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../../utils/renderWithProviders';
import { ServiceStatusCard } from '@/features/status/components/ServiceStatusCard';

describe('ServiceStatusCard', () => {
  it('renders service name, status and description from the API', async () => {
    renderWithProviders(<ServiceStatusCard />);

    // Resolves once MSW returns the mocked /status response.
    expect(
      await screen.findByRole('heading', { name: 'Hiscox.RiskModeller.Api' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Healthy')).toBeInTheDocument();
    expect(
      screen.getByText(/integration layer between Hiscox internal systems/i),
    ).toBeInTheDocument();
    expect(screen.getByText("Moody's connectivity:")).toBeInTheDocument();
    expect(screen.getByText('Reachable')).toBeInTheDocument();
    expect(screen.getByText(/client IP: 203\.0\.113\.42/)).toBeInTheDocument();
  });
});
