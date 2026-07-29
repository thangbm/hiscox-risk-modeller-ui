import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { InteractionStatus } from '@azure/msal-browser';
import { useIsAuthenticated, useMsal } from '@azure/msal-react';
import { RequireAuth } from '@/auth/RequireAuth';

vi.mock('@azure/msal-react', () => ({
  useIsAuthenticated: vi.fn(),
  useMsal: vi.fn(),
}));

describe('RequireAuth', () => {
  const loginRedirect = vi.fn();

  beforeEach(() => {
    loginRedirect.mockClear();
  });

  it('redirects to login when unauthenticated', () => {
    vi.mocked(useIsAuthenticated).mockReturnValue(false);
    vi.mocked(useMsal).mockReturnValue({
      instance: { loginRedirect },
      inProgress: InteractionStatus.None,
    } as unknown as ReturnType<typeof useMsal>);

    render(
      <RequireAuth>
        <div>Protected</div>
      </RequireAuth>,
    );

    expect(loginRedirect).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Protected')).not.toBeInTheDocument();
  });

  it('renders children when authenticated', () => {
    vi.mocked(useIsAuthenticated).mockReturnValue(true);
    vi.mocked(useMsal).mockReturnValue({
      instance: { loginRedirect },
      inProgress: InteractionStatus.None,
    } as unknown as ReturnType<typeof useMsal>);

    render(
      <RequireAuth>
        <div>Protected</div>
      </RequireAuth>,
    );

    expect(screen.getByText('Protected')).toBeInTheDocument();
    expect(loginRedirect).not.toHaveBeenCalled();
  });
});
