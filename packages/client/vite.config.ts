import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import stylex from '@stylexjs/rollup-plugin'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), stylex({})],
})
