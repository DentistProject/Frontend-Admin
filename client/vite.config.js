import { defineConfig, loadEnv} from 'vite'
import vue from '@vitejs/plugin-vue'
// import * as path from 'path'
// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd());
  return {
      plugins: [vue()],
    define: {
      'process.env.VITE_MAPBOX': JSON.stringify(env.VITE_MAPBOX),
    },
  }
})
// { path: '../.env' }/