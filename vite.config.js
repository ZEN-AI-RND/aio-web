import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/aio-web/',
  server: {
    host: true,
    // 5174 is the port wired through the Windows portproxy + firewall for
    // phone/LAN testing (see WSL2 NAT notes), so keep it pinned.
    port: 5174,
    strictPort: true,
  },
})
