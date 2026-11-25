import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// viteSingleFile inlines the built JS/CSS into one dist/index.html,
// so the production build can still be shared as a single link if needed.
export default defineConfig({
  plugins: [react(), viteSingleFile()],
});
