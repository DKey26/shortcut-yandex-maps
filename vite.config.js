import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
  ],
  define: {
    'process.env': process.env,
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  esbuild: {
    legalComments: 'none',
  },
});
