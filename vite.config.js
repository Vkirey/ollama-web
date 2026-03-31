import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/ollama-web/',
  plugins: [react()],
  server: {
    port: 5173,
  }
});
