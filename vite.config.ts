import { defineConfig, loadEnv, type PluginOption } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const plugins: PluginOption[] = [react(), tailwindcss()];

  const env = loadEnv(mode, process.cwd(), ['VITE_', 'NEXT_PUBLIC_']);
  const processEnvDefines: Record<string, string> = {};
  for (const [key, value] of Object.entries(env)) {
    processEnvDefines[`process.env.${key}`] = JSON.stringify(value);
  }

  return {
    plugins,
    envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
    define: processEnvDefines,
    optimizeDeps: {
      include: ['mammoth', 'pdfjs-dist', 'chart.js', 'react-chartjs-2'],
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id: string) {
            if (id.includes('node_modules')) {
              if (id.includes('pdfjs-dist')) return 'pdfjs';
              if (id.includes('mammoth')) return 'mammoth';
              if (id.includes('chart.js') || id.includes('react-chartjs-2')) return 'charts';
              if (id.includes('framer-motion')) return 'motion';
              if (
                id.includes('react-dom') ||
                id.includes('react-router') ||
                id.includes('/react/')
              ) {
                return 'react-vendor';
              }
            }
            return undefined;
          },
        },
      },
      chunkSizeWarningLimit: 1200,
    },
  };
});
