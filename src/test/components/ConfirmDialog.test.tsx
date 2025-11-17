import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/utils';
import userEvent from '@testing-library/user-event';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import React from 'react';

describe('ConfirmDialog', () => {
  it('renders when open is true', () => {
    render(
      <ConfirmDialog
        open={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
  });

  it('does not render when open is false', () => {
    render(
      <ConfirmDialog
        open={false}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );
    expect(screen.queryByText('Are you sure?')).not.toBeInTheDocument();
  });

  it('renders custom title', () => {
    render(
      <ConfirmDialog
        open={true}
        title="Custom Title"
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );
    expect(screen.getByText('Custom Title')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(
      <ConfirmDialog
        open={true}
        description="Are you sure you want to delete this item?"
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );
    expect(screen.getByText('Are you sure you want to delete this item?')).toBeInTheDocument();
  });

  it('renders children when provided', () => {
    render(
      <ConfirmDialog
        open={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      >
        <div>Custom Content</div>
      </ConfirmDialog>
    );
    expect(screen.getByText('Custom Content')).toBeInTheDocument();
  });

  it('calls onClose when cancel button is clicked', () => {
    const onClose = vi.fn();
    render(
      <ConfirmDialog
        open={true}
        onClose={onClose}
        onConfirm={vi.fn()}
      />
    );
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    cancelButton.click();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onConfirm when confirm button is clicked', () => {
    const onConfirm = vi.fn();
    render(
      <ConfirmDialog
        open={true}
        onClose={vi.fn()}
        onConfirm={onConfirm}
      />
    );
    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    confirmButton.click();
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('renders custom confirm and cancel labels', () => {
    render(
      <ConfirmDialog
        open={true}
        confirmLabel="Delete"
        cancelLabel="Keep"
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );
    expect(screen.getByText('Delete')).toBeInTheDocument();
    expect(screen.getByText('Keep')).toBeInTheDocument();
  });

  it('disables confirm button when loading', () => {
    render(
      <ConfirmDialog
        open={true}
        loading={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );
    const confirmButton = screen.getByText('Confirm');
    expect(confirmButton).toBeDisabled();
  });

  it('disables confirm button when confirmDisabled is true', () => {
    render(
      <ConfirmDialog
        open={true}
        confirmDisabled={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );
    const confirmButton = screen.getByText('Confirm');
    expect(confirmButton).toBeDisabled();
  });

  it('disables cancel button when loading', () => {
    render(
      <ConfirmDialog
        open={true}
        loading={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );
    const cancelButton = screen.getByText('Cancel');
    expect(cancelButton).toBeDisabled();
  });
});

