import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

const isProduction = process.env.NODE_ENV === 'production'

export default defineConfig({
    plugins: [react(), !isProduction && basicSsl()].filter(Boolean),
    server: {
        port: 5173,
        host: '0.0.0.0', // Listen on all interfaces
        proxy: {
            '/api': {
                target: 'http://127.0.0.1:8080', // Folosim IP-ul local direct în loc de localhost
                changeOrigin: true,
                secure: false,  // Oprește verificarea strictă de SSL în proxy
                ws: true
            }
        }
    },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './src/setupTests.js',
    },
})


