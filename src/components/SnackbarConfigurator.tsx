import { useEffect } from 'react';
import { useSnackbar } from 'notistack';
import { setEnqueueSnackbar } from '@/utils/toast';

export default function SnackbarConfigurator() {
  const { enqueueSnackbar } = useSnackbar();
  useEffect(() => {
    setEnqueueSnackbar(enqueueSnackbar);
  }, [enqueueSnackbar]);
  return null;
}
