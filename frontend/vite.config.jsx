import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig({
    plugins: [react(), basicSsl()],
    server: {
        port: 5173,
        host: '0.0.0.0',
        proxy: {
            '/api': {
                // 1. Schimbăm IP-ul vechi cu localhost și portul pe 8080 (unde pornește Spring Boot-ul tău)
                target: 'http://localhost:8081',
                changeOrigin: true,
                // 2. Punem secure false pentru siguranță
                secure: false
            }
        }
    },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './src/setupTests.js',
    },
})