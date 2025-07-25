import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');   // loads every VAR from .env

  return {
    define: {
      // Inject only the four keys we actually use
      'process.env.JSONBIN_API_KEY': JSON.stringify(env.JSONBIN_API_KEY),
      'process.env.JSONBIN_BIN_ID' : JSON.stringify(env.JSONBIN_BIN_ID),
      'process.env.APP_USERNAME'   : JSON.stringify(env.APP_USERNAME),
      'process.env.APP_PASSWORD'   : JSON.stringify(env.APP_PASSWORD),
    },

    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
  };
});