import path from 'path';
import react from '@vitejs/plugin-react';

export function getConfig(mode: string): any {
  const isProduction = mode.includes('production');

  return {
    plugins: [react()],
    resolve: {
      ...(isProduction
        ? {
            // Enables MobX production build
            mainFields: ['jsnext:main', 'module', 'main'],
          }
        : {}),
      alias: {
        $: path.resolve(__dirname, './src'),
        $api: path.resolve(__dirname, './src/common/api'),
        $components: path.resolve(__dirname, './src/components'),
        $hooks: path.resolve(__dirname, './src/common/hooks'),
        $modals: path.resolve(__dirname, './src/modals'),
        $stores: path.resolve(__dirname, './src/stores'),
        $utils: path.resolve(__dirname, './src/common/utils'),
      },
    },
  };
}
