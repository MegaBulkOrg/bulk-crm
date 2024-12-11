// https://vitejs.dev/config/

import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path';

export default ({mode}: {mode:string }) => {
  process.env = {...process.env, ...loadEnv(mode, process.cwd())};
  return defineConfig({  
    server: {
      port: parseInt(process.env.VITE_REACT_APP_PORT || '')
    },
    resolve: {
      alias: {
        'Assets': path.resolve(__dirname, './src/assets'),
        'Redux': path.resolve(__dirname, './src/redux'),
        'Pages': path.resolve(__dirname, './src/pages'),
        'Components': path.resolve(__dirname, './src/components'),
        'GlobalStyles': path.resolve(__dirname, './src/global_styles')
      }
    },
    publicDir: 'src/assets',
    plugins: [react()],
  })
}