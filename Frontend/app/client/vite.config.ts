import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      'shared-utils': path.resolve(__dirname, '../../packages/utils'),
      'ui-shared': path.resolve(__dirname, '../../packages/ui-shared'),
    },
  },
  server: {
  host: true,
  port: 5174,
  open: false,
}
})
