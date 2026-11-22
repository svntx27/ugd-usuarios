import { sileo } from 'sileo';

export const toast = {
  success: (title: string, opts?: { description?: string } | string) => {
    const description = typeof opts === 'string' ? opts : opts?.description;
    sileo.success({ title, description });
  },
  error: (title: string, opts?: { description?: string } | string) => {
    const description = typeof opts === 'string' ? opts : opts?.description;
    sileo.error({ title, description });
  },
  info: (title: string, opts?: { description?: string } | string) => {
    const description = typeof opts === 'string' ? opts : opts?.description;
    sileo.info({ title, description });
  },
  warning: (title: string, opts?: { description?: string } | string) => {
    const description = typeof opts === 'string' ? opts : opts?.description;
    sileo.warning({ title, description });
  },
};

export { sileo };
