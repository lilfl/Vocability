import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/notion': {
        target: 'https://api.notion.com',
        changeOrigin: true,
        rewrite: (path) => {
          const qs = path.split('?')[1] || ''
          return '/' + (new URLSearchParams(qs).get('path') || '')
        },
        headers: { 'Notion-Version': '2022-06-28' },
      },
      '/api/openai': {
        target: 'https://api.openai.com',
        changeOrigin: true,
        rewrite: (path) => {
          const qs = path.split('?')[1] || ''
          return '/' + (new URLSearchParams(qs).get('path') || '')
        },
      },
    },
  },
})
