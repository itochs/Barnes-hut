import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        nested: resolve(__dirname, 'src/pages/barnes-hut/index.html'),
        exercise_barnes_hut: resolve(__dirname, 'src/pages/exercise/barnes-hut/index.html'),
        exercise_fdp: resolve(__dirname, 'src/pages/exercise/fdp/index.html'),
      },
    },
  },
})
