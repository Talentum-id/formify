import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import path from 'path';
import dfxJson from './dfx.json';
import fs from 'fs';
require('dotenv').config();

const network = process.env['DFX_NETWORK'];

const isDev = network === 'local';
const isPlayground = network === 'playground';

const DFX_PORT = isDev ? dfxJson.networks.local?.bind.split(':')[1] || process.env['DFX_PORT'] : process.env['DFX_PORT'];

let canisterIds;
try {
  canisterIds = JSON.parse(
    fs.readFileSync(isDev || isPlayground ? `.dfx/${network}/canister_ids.json` : './canister_ids.json').toString(),
  );
} catch (e) {
  console.error('\n⚠️  Before starting the dev server run: dfx deploy\n\n');
}

const aliases = Object.entries(dfxJson.canisters).reduce((acc, [name, _value]) => {
  const outputRoot = path.join(__dirname, '.dfx', network || 'local', 'canisters', name);

  return {
    ...acc,
    ['canisters/' + name]: path.join(outputRoot, 'index' + '.js'),
  };
}, {});

const canisterDefinitions = Object.entries(canisterIds).reduce(
  (acc, [key, val]) => ({
    ...acc,
    [`process.env.${key.toUpperCase()}_CANISTER_ID`]: isDev || isPlayground
      ? JSON.stringify(val[network])
      : JSON.stringify(val.ic),
  }),
  {},
);

const internetIdentityUri = isDev
  ? `http://localhost:${DFX_PORT}/?canisterId=${JSON.parse(
      canisterDefinitions['process.env.INTERNET_IDENTITY_CANISTER_ID'],
    )}`
  : 'https://identity.ic0.app';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      vue: path.resolve('./node_modules/vue'),
      '@': fileURLToPath(new URL('./frontend', import.meta.url)),
      '~': fileURLToPath(new URL('./src/declarations', import.meta.url)),
      ...aliases,
    },
  },
  css: {
    minify: true,
    preprocessorOptions: {
      scss: {
        additionalData: '@import "@/assets/scss/main.scss";',
      },
    },
  },
  server: {
    fs: {
      allow: ['.'],
    },
    proxy: {
      '/api': {
        target: `http://0.0.0.0:${DFX_PORT}`,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      },
    },
  },
  define: {
    ...canisterDefinitions,
    'process.env.II_URI': JSON.stringify(internetIdentityUri),
    'process.env.NODE_ENV': JSON.stringify(isDev ? 'development' : 'production'),
    'process.env.DFX_ASSET_PRINCIPAL': JSON.stringify(process.env.DFX_ASSET_PRINCIPAL),
  },
});
