import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Alert, AlertTitle, Box } from '@mui/material';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error isolation boundary. The host wraps each remote route in its own
 * Suspense + ErrorBoundary; this boundary also guards the remote internally so
 * a failure stays contained to this app rather than crashing the shell.
 * See: .ai/docs/Micro-Frontend-Architecture.md (Error Isolation).
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Replace with the shared logging/telemetry sink when available.
    console.error('RiskModeller remote error:', error, info);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <Box sx={{ p: 3 }}>
            <Alert severity="error">
              <AlertTitle>Something went wrong</AlertTitle>
              {this.state.error?.message ??
                'An unexpected error occurred in the Risk Modeller module.'}
            </Alert>
          </Box>
        )
      );
    }
    return this.props.children;
  }
}
