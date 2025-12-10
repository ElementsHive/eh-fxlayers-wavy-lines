import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, './index.js'),
      name: 'EhFxLayersWavyLines',
      fileName: 'eh-fx-layers-wavy-lines.js',
    },
    target: 'esnext',
  },
  worker: {
    format: 'es',
    plugins: [],
  },
})
