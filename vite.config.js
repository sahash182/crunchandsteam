import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import menuData from './vite-plugins/menu-data.js'

export default defineConfig({
  plugins: [react(), menuData()],
})
