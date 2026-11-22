import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  server: {
    port: 4321,
    host: true,
  },
  output: 'server',
  // Precarga la sección al pasar el mouse por un enlace: el cambio de página se siente inmediato
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
  adapter: node({
    mode: 'standalone',
  }),
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
});
