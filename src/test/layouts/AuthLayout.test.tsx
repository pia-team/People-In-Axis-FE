import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/utils';
import AuthLayout from '@/layouts/AuthLayout';
import React from 'react';

describe('AuthLayout', () => {
  it('renders layout with main elements', () => {
    render(<AuthLayout />);

    // Check for main layout elements
    expect(screen.getByText(/people in axis/i)).toBeInTheDocument();
    expect(screen.getByText(/sign in to continue to your workspace/i)).toBeInTheDocument();
  });

  it('renders with correct styling classes', () => {
    const { container } = render(<AuthLayout />);

    // Check for Paper component (main content area)
    const paper = container.querySelector('.MuiPaper-root');
    expect(paper).toBeInTheDocument();
  });

  it('displays application title', () => {
    render(<AuthLayout />);

    expect(screen.getByText(/people in axis/i)).toBeInTheDocument();
  });

  it('displays subtitle text', () => {
    render(<AuthLayout />);

    expect(screen.getByText(/sign in to continue to your workspace/i)).toBeInTheDocument();
  });

  it('renders Container component', () => {
    const { container } = render(<AuthLayout />);

    // Check for Container component
    const mainContainer = container.querySelector('.MuiContainer-root');
    expect(mainContainer).toBeInTheDocument();
  });
});

