import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.js',
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{js,jsx}'],
      exclude: ['src/__tests__/**', 'src/main.jsx', 'src/setupTests.js'],
      // lcov: lo lee SonarCloud · cobertura: lo muestra Azure DevOps · text: consola
      reporter: ['text', 'lcov', 'cobertura'],
      reportsDirectory: 'coverage',
    },
  },
})
