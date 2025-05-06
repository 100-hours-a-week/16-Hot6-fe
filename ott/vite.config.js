import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
    proxy: {
      // 콜백 경로 프록시
      '/login/oauth2': {
        target: 'https://dev-backend.onthe-top.com',
        changeOrigin: true,
      },
    },
  },
});
