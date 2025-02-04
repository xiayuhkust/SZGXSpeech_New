import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    allowedHosts: [
      'text-processor-app-tunnel-uo6ybgh3.devinapps.com',
      'text-processor-app-tunnel-bcj40dad.devinapps.com'
    ],
    cors: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, _req, _res) => {
            proxyReq.setHeader('Authorization', 'Basic ' + Buffer.from('user:03c0a8845acc463066984d155b42a131').toString('base64'));
            proxyReq.setHeader('Accept', 'text/plain, application/json');
            proxyReq.setHeader('Access-Control-Allow-Origin', '*');
          });
        }
      }
    }
  }
})

