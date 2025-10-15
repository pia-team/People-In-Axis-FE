import { OptionsObject, SnackbarKey, SnackbarMessage } from 'notistack';

let enqueueRef: ((message: SnackbarMessage, options?: OptionsObject) => SnackbarKey) | null = null;

export const setEnqueueSnackbar = (fn: typeof enqueueRef) => {
  enqueueRef = fn;
};

export const toast = {
  info: (msg: string, opts?: OptionsObject) => enqueueRef?.(msg, { variant: 'info', ...opts }),
  success: (msg: string, opts?: OptionsObject) => enqueueRef?.(msg, { variant: 'success', ...opts }),
  warning: (msg: string, opts?: OptionsObject) => enqueueRef?.(msg, { variant: 'warning', ...opts }),
  error: (msg: string, opts?: OptionsObject) => enqueueRef?.(msg, { variant: 'error', ...opts }),
};
