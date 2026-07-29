import type { ReactNode } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RequireRole } from '@/auth/RequireRole';
import { useAuth } from '@/auth/useAuth';

vi.mock('@/auth/RequireAuth', () => ({
  RequireAuth: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock('@/auth/useAuth', () => ({
  useAuth: vi.fn(),
}));

describe('RequireRole', () => {
  it('renders children when the account has the required role', () => {
    vi.mocked(useAuth).mockReturnValue({
      userName: 'Jane Doe',
      roles: ['RiskModeller.Read'],
      isAuthenticated: true,
      getAccessToken: vi.fn(),
    });

    render(
      <RequireRole requiredRole="RiskModeller.Read">
        <div>Risk Modeller</div>
      </RequireRole>,
    );

    expect(screen.getByText('Risk Modeller')).toBeInTheDocument();
  });

  it('renders a not-authorized message when the role is missing', () => {
    vi.mocked(useAuth).mockReturnValue({
      userName: 'Jane Doe',
      roles: [],
      isAuthenticated: true,
      getAccessToken: vi.fn(),
    });

    render(
      <RequireRole requiredRole="RiskModeller.Read">
        <div>Risk Modeller</div>
      </RequireRole>,
    );

    expect(screen.queryByText('Risk Modeller')).not.toBeInTheDocument();
    expect(screen.getByText(/do not have the required role/i)).toBeInTheDocument();
  });
});
