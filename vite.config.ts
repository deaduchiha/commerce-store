import tailwindcss from '@tailwindcss/vite'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

/** Native / server-only deps — keep out of Rolldown SSR bundles. */
const serverExternal = [
  'better-sqlite3',
  'drizzle-orm',
  'drizzle-orm/better-sqlite3',
  'better-auth',
  'better-auth/adapters/drizzle',
  'better-auth/plugins',
  'better-auth/tanstack-start',
] as const

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [devtools(), tailwindcss(), tanstackStart(), viteReact()],
  ssr: {
    external: [...serverExternal],
  },
  build: {
    chunkSizeWarningLimit: 600,
    rolldownOptions: {
      external: [...serverExternal],
    },
  },
  optimizeDeps: {
    exclude: ['better-sqlite3'],
  },
})

export default config
