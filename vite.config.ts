import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    global: 'globalThis',
    'process.env': {},
  },
  build: {
    rollupOptions: {
      external: [
        // Node.js модули которых нет в браузере
        'http-proxy-agent',
        'https-proxy-agent', 
        'socks-proxy-agent',
        'ws',
        'crypto',
        'fs',
        'path',
        'url',
        'zlib',
        'stream',
        'buffer',
        'util',
        'querystring',
        'http',
        'https',
        'net',
        'tls',
        'events',
        'assert',
      ],
    },
  },
  optimizeDeps: {
    // Не предзагружаем CCXT из-за сложных зависимостей
    exclude: ['ccxt'],
    // Включаем только необходимые полифиллы
    include: ['buffer', 'process'],
  },
  // Настройки для совместимости с браузером
  esbuild: {
    define: {
      global: 'globalThis',
    },
  },
}));
