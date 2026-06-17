import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (
              id.includes('react-dom') || 
              id.includes('react-is') || 
              id.includes('scheduler') || 
              id.includes('/react/')
            ) {
              return 'react-vendor';
            }
            if (
              id.includes('react-router') || 
              id.includes('react-router-dom') || 
              id.includes('@remix-run')
            ) {
              return 'router-vendor';
            }
            if (id.includes('framer-motion')) {
              return 'motion-vendor';
            }
            if (id.includes('lucide-react')) {
              return 'icons-vendor';
            }
            return 'vendor';
          }
        }
      }
    }
  }
});
