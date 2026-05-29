import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { fileURLToPath } from 'url';
import { VitePWA } from 'vite-plugin-pwa';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isApp = mode === "app";
  const isTeacher = mode === "teacher";

  return {
    server: {
      headers: {
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Cross-Origin-Embedder-Policy': 'require-corp',
      },
      host: true,
      port: 5173,
      open: false,
      hmr: {
        overlay: false,
      },
      proxy: {
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true,
          // Suppress noise in the terminal when the backend is not running
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, res) => {
              (res as any).writeHead(502, { 'Content-Type': 'text/plain' });
              res.end('Backend server is offline. Using local development fallback.');
            });
          },
        },
      },
    },
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        manifest: {
          name: 'Sned-Link',
          short_name: 'Sned-Link',
          description: 'Special Needs Education Link System - SNED-Link+',
          theme_color: '#064e3b',
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2,wasm}'],
          // Sinisiguro nito na ang app shell ay laging available
          navigateFallback: mode === "app" ? "/app.html" : "/index.html",
          // Para sa mga Web Workers
          inlineWorkboxRuntime: true
        }
      }),
      mode === "development" && componentTagger(),
      // Middleware to internally rewrite "/" to "/app.html" when in app mode
      isApp && {
        name: "rewrite-to-app",
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            if (req.url === "/") {
              req.url = "/app.html";
            }
            next();
          });
        },
      },
      isTeacher && {
        name: "rewrite-to-teacher",
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            if (req.url === "/") {
              req.url = "/teacher.html";
            }
            next();
          });
        },
      },

    ].filter(Boolean),
    optimizeDeps: {
      include: ["three", "react-reconciler", "react-reconciler/constants", "scheduler"],
      exclude: ["@react-three/fiber"],
    },
    build: {
      outDir: mode === 'web' ? 'dist/web' : 'dist/app',
      emptyOutDir: true,
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, "index.html"),
          app: path.resolve(__dirname, "app.html"),
          teacher: path.resolve(__dirname, "teacher.html"),
        },
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
      dedupe: ["react", "react-dom", "three", "react-reconciler"],
    },
  };
});
