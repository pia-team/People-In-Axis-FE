import { describe, it, expect, vi, beforeEach } from 'vitest';
import { toast, setEnqueueSnackbar } from '@/utils/toast';
import { SnackbarKey } from 'notistack';

describe('toast', () => {
  beforeEach(() => {
    // Reset enqueueRef before each test
    setEnqueueSnackbar(null);
  });

  it('calls enqueueSnackbar with info variant', () => {
    const mockEnqueue = vi.fn(() => 'mock-key' as SnackbarKey);
    setEnqueueSnackbar(mockEnqueue);

    toast.info('Test message');

    expect(mockEnqueue).toHaveBeenCalledWith('Test message', { variant: 'info' });
  });

  it('calls enqueueSnackbar with success variant', () => {
    const mockEnqueue = vi.fn(() => 'mock-key' as SnackbarKey);
    setEnqueueSnackbar(mockEnqueue);

    toast.success('Success message');

    expect(mockEnqueue).toHaveBeenCalledWith('Success message', { variant: 'success' });
  });

  it('calls enqueueSnackbar with warning variant', () => {
    const mockEnqueue = vi.fn(() => 'mock-key' as SnackbarKey);
    setEnqueueSnackbar(mockEnqueue);

    toast.warning('Warning message');

    expect(mockEnqueue).toHaveBeenCalledWith('Warning message', { variant: 'warning' });
  });

  it('calls enqueueSnackbar with error variant', () => {
    const mockEnqueue = vi.fn(() => 'mock-key' as SnackbarKey);
    setEnqueueSnackbar(mockEnqueue);

    toast.error('Error message');

    expect(mockEnqueue).toHaveBeenCalledWith('Error message', { variant: 'error' });
  });

  it('merges custom options with variant', () => {
    const mockEnqueue = vi.fn(() => 'mock-key' as SnackbarKey);
    setEnqueueSnackbar(mockEnqueue);

    toast.info('Test message', { autoHideDuration: 5000 });

    expect(mockEnqueue).toHaveBeenCalledWith('Test message', {
      variant: 'info',
      autoHideDuration: 5000,
    });
  });

  it('does not throw error when enqueueSnackbar is not set', () => {
    setEnqueueSnackbar(null);

    expect(() => {
      toast.info('Test message');
      toast.success('Success message');
      toast.warning('Warning message');
      toast.error('Error message');
    }).not.toThrow();
  });

  it('returns snackbar key from enqueueSnackbar', () => {
    const mockKey = 'test-key' as SnackbarKey;
    const mockEnqueue = vi.fn(() => mockKey);
    setEnqueueSnackbar(mockEnqueue);

    const result = toast.info('Test message');

    expect(result).toBe(mockKey);
  });

  it('handles undefined return from enqueueSnackbar', () => {
    const mockEnqueue = vi.fn(() => undefined);
    setEnqueueSnackbar(mockEnqueue);

    const result = toast.info('Test message');

    expect(result).toBeUndefined();
  });
});


