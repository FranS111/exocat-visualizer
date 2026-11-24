import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * On Windows, antivirus/indexers briefly lock folders while files are saved and the
 * file watcher emits EBUSY/EPERM. Vite has no listener for watcher errors, so one
 * transient lock kills the dev server. Handling the event keeps it alive.
 */
function tolerateWatcherLocks(): Plugin {
  return {
    name: 'tolerate-watcher-locks',
    apply: 'serve',
    configureServer(server) {
      server.watcher.on('error', (err) => {
        const code = (err as NodeJS.ErrnoException).code;
        if (code === 'EBUSY' || code === 'EPERM') {
          server.config.logger.warn(`[watcher] ignored transient ${code}: ${(err as NodeJS.ErrnoException).path ?? ''}`);
          return;
        }
        server.config.logger.error(`[watcher] ${String(err)}`);
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tolerateWatcherLocks()],
  server: {
    port: 5173,
    strictPort: true,
    // Polling avoids most native-event races on Windows; the plugin above covers the rest.
    watch: process.platform === 'win32' ? { usePolling: true, interval: 250 } : undefined,
  },
  build: {
    rollupOptions: {
      output: {
        // Long-lived vendor chunks cache independently of app code.
        manualChunks: {
          react: ['react', 'react-dom'],
          map: ['leaflet', 'react-leaflet'],
          charts: ['recharts'],
        },
      },
    },
  },
});
