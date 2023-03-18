import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vitest/config';
import eslint from 'vite-plugin-eslint';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), eslint()],
  test: {
    coverage: {
      reporter: ['text', 'json', 'html'],
      provider: 'c8',
    },
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/tests/setup.ts',
  },
});
