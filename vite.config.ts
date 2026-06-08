import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // 使用相对路径,使产物可部署在任意子路径下(如 /toy/bbxy-toy)
  base: './',
  plugins: [react()],
})
