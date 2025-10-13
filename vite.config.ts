
  import { defineConfig } from 'vite';
  import react from '@vitejs/plugin-react-swc';
  import path from 'path';

  export default defineConfig({
    plugins: [react()],
    // Use /Numera/ for GitHub Pages deployment
    // Set VITE_BASE_PATH=/ for local server deployment
    base: process.env.VITE_BASE_PATH || '/Numera/',
    define: {
      // Add build timestamp for cache busting
      __BUILD_TIMESTAMP__: JSON.stringify(new Date().toISOString())
    },
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
      alias: {
        'vaul@1.1.2': 'vaul',
        'sonner@2.0.8': 'sonner',
        'sonner@2.0.3': 'sonner',
        'recharts@2.15.4': 'recharts',
        'recharts@2.15.2': 'recharts',
        'react-resizable-panels@2.1.9': 'react-resizable-panels',
        'react-resizable-panels@2.1.7': 'react-resizable-panels',
        'react-hook-form@7.63.0': 'react-hook-form',
        'react-hook-form@7.55.0': 'react-hook-form',
        'react-day-picker@8.10.1': 'react-day-picker',
        'next-themes@0.4.6': 'next-themes',
        'lucide-react@0.544.0': 'lucide-react',
        'lucide-react@0.487.0': 'lucide-react',
        'input-otp@1.4.2': 'input-otp',
        'embla-carousel-react@8.6.0': 'embla-carousel-react',
        'cmdk@1.1.1': 'cmdk',
        'class-variance-authority@0.7.1': 'class-variance-authority',
        '@radix-ui/react-tooltip@1.2.8': '@radix-ui/react-tooltip',
        '@radix-ui/react-tooltip@1.1.8': '@radix-ui/react-tooltip',
        '@radix-ui/react-toggle@1.1.10': '@radix-ui/react-toggle',
        '@radix-ui/react-toggle@1.1.2': '@radix-ui/react-toggle',
        '@radix-ui/react-toggle-group@1.1.11': '@radix-ui/react-toggle-group',
        '@radix-ui/react-toggle-group@1.1.2': '@radix-ui/react-toggle-group',
        '@radix-ui/react-tabs@1.1.13': '@radix-ui/react-tabs',
        '@radix-ui/react-tabs@1.1.3': '@radix-ui/react-tabs',
        '@radix-ui/react-switch@1.2.6': '@radix-ui/react-switch',
        '@radix-ui/react-switch@1.1.3': '@radix-ui/react-switch',
        '@radix-ui/react-slot@1.2.3': '@radix-ui/react-slot',
        '@radix-ui/react-slot@1.1.2': '@radix-ui/react-slot',
        '@radix-ui/react-slider@1.3.6': '@radix-ui/react-slider',
        '@radix-ui/react-slider@1.2.3': '@radix-ui/react-slider',
        '@radix-ui/react-separator@1.1.7': '@radix-ui/react-separator',
        '@radix-ui/react-separator@1.1.2': '@radix-ui/react-separator',
        '@radix-ui/react-select@2.2.6': '@radix-ui/react-select',
        '@radix-ui/react-select@2.1.6': '@radix-ui/react-select',
        '@radix-ui/react-scroll-area@1.2.10': '@radix-ui/react-scroll-area',
        '@radix-ui/react-scroll-area@1.2.3': '@radix-ui/react-scroll-area',
        '@radix-ui/react-radio-group@1.3.8': '@radix-ui/react-radio-group',
        '@radix-ui/react-radio-group@1.2.3': '@radix-ui/react-radio-group',
        '@radix-ui/react-progress@1.1.7': '@radix-ui/react-progress',
        '@radix-ui/react-progress@1.1.2': '@radix-ui/react-progress',
        '@radix-ui/react-popover@1.1.15': '@radix-ui/react-popover',
        '@radix-ui/react-popover@1.1.6': '@radix-ui/react-popover',
        '@radix-ui/react-navigation-menu@1.2.14': '@radix-ui/react-navigation-menu',
        '@radix-ui/react-navigation-menu@1.2.5': '@radix-ui/react-navigation-menu',
        '@radix-ui/react-menubar@1.1.16': '@radix-ui/react-menubar',
        '@radix-ui/react-menubar@1.1.6': '@radix-ui/react-menubar',
        '@radix-ui/react-label@2.1.7': '@radix-ui/react-label',
        '@radix-ui/react-label@2.1.2': '@radix-ui/react-label',
        '@radix-ui/react-hover-card@1.1.15': '@radix-ui/react-hover-card',
        '@radix-ui/react-hover-card@1.1.6': '@radix-ui/react-hover-card',
        '@radix-ui/react-dropdown-menu@2.1.16': '@radix-ui/react-dropdown-menu',
        '@radix-ui/react-dropdown-menu@2.1.6': '@radix-ui/react-dropdown-menu',
        '@radix-ui/react-dialog@1.1.15': '@radix-ui/react-dialog',
        '@radix-ui/react-dialog@1.1.6': '@radix-ui/react-dialog',
        '@radix-ui/react-context-menu@2.2.16': '@radix-ui/react-context-menu',
        '@radix-ui/react-context-menu@2.2.6': '@radix-ui/react-context-menu',
        '@radix-ui/react-collapsible@1.1.12': '@radix-ui/react-collapsible',
        '@radix-ui/react-collapsible@1.1.3': '@radix-ui/react-collapsible',
        '@radix-ui/react-checkbox@1.3.3': '@radix-ui/react-checkbox',
        '@radix-ui/react-checkbox@1.1.4': '@radix-ui/react-checkbox',
        '@radix-ui/react-avatar@1.1.10': '@radix-ui/react-avatar',
        '@radix-ui/react-avatar@1.1.3': '@radix-ui/react-avatar',
        '@radix-ui/react-aspect-ratio@1.1.7': '@radix-ui/react-aspect-ratio',
        '@radix-ui/react-aspect-ratio@1.1.2': '@radix-ui/react-aspect-ratio',
        '@radix-ui/react-alert-dialog@1.1.15': '@radix-ui/react-alert-dialog',
        '@radix-ui/react-alert-dialog@1.1.6': '@radix-ui/react-alert-dialog',
        '@radix-ui/react-accordion@1.2.12': '@radix-ui/react-accordion',
        '@radix-ui/react-accordion@1.2.3': '@radix-ui/react-accordion',
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      target: 'esnext',
      outDir: 'build',
      sourcemap: false,
      rollupOptions: {
        output: {
          // Enable manual chunks for better code splitting
          manualChunks: {
            // Vendor libraries
            'vendor-react': ['react', 'react-dom'],
            'vendor-radix': [
              '@radix-ui/react-accordion',
              '@radix-ui/react-alert-dialog',
              '@radix-ui/react-avatar',
              '@radix-ui/react-checkbox',
              '@radix-ui/react-dialog',
              '@radix-ui/react-dropdown-menu',
              '@radix-ui/react-popover',
              '@radix-ui/react-select',
              '@radix-ui/react-switch',
              '@radix-ui/react-tabs'
            ],
            'vendor-ui': [
              'lucide-react',
              'sonner',
              'next-themes',
              'class-variance-authority',
              'clsx',
              'tailwind-merge'
            ],
            'vendor-charts': ['recharts'],
            'vendor-forms': ['react-hook-form', 'react-day-picker']
          },
          // Add hash to filenames for cache busting
          assetFileNames: 'assets/[name].[hash][extname]',
          chunkFileNames: 'assets/[name].[hash].js',
          entryFileNames: 'assets/[name].[hash].js'
        }
      },
      chunkSizeWarningLimit: 1000
    },
    server: {
      port: 3000,
      open: true,
    },
  });